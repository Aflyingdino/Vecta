import { computed } from 'vue'
import { activeProject, logActivity, _save } from './projectStore'
import { api } from '@/utils/api'
import { user } from './authStore'
import { STATUS_META } from '../utils/constants'

function actor() {
  return user.name || 'Someone'
}

/* ---------------------------------------------
   Board Store - thin layer over the active project.
   Mutations update local reactive state AND call
   the PHP API for persistence.
--------------------------------------------- */

function b() { return activeProject.value }

/* -- Getters -- */
export const groups         = computed(() => b()?.groups ?? [])
export const backlog        = computed(() => b()?.backlog ?? [])
export const projectLabels  = computed(() => b()?.labels ?? [])
export const archivedGroups = computed(() => b()?.archivedGroups ?? [])

/* -- Task lookup -- */
export function findTask(taskId) {
  const board = b(); if (!board) return null
  const bl = board.backlog.find((t) => t.id === taskId)
  if (bl) return bl
  for (const g of board.groups) {
    const t = g.tasks.find((t) => t.id === taskId)
    if (t) return t
  }
  return null
}

/* -- Group actions -- */
export async function createGroup(name) {
  const board = b(); if (!board) return
  const usedRows = board.groups
    .filter(g => (g.gridCol ?? 0) === 0)
    .map(g => g.gridRow ?? 0)
  let nextRow = 0
  while (usedRows.includes(nextRow)) nextRow++

  const payload = {
    name: name || 'New Group',
    gridRow: nextRow,
    gridCol: 0,
  }

  const created = await api.post(`/projects/${board.id}/groups`, payload)
  created.tasks = created.tasks || []
  board.groups.push(created)
}

function compactColumns(board) {
  const cols = {}
  for (const g of board.groups) {
    const c = g.gridCol ?? 0
    if (!cols[c]) cols[c] = []
    cols[c].push(g)
  }
  for (const colGroups of Object.values(cols)) {
    colGroups.sort((a, b) => (a.gridRow ?? 0) - (b.gridRow ?? 0))
    colGroups.forEach((g, i) => { g.gridRow = i })
  }
}

export async function moveGroupToGrid(fromId, toRow, toCol) {
  const board = b(); if (!board) return
  const fromGroup = board.groups.find(g => g.id === fromId)
  if (!fromGroup) return
  
  // Store original positions for rollback
  const originalFromRow = fromGroup.gridRow
  const originalFromCol = fromGroup.gridCol
  
  const toGroup = board.groups.find(
    g => g.id !== fromId && (g.gridRow ?? 0) === toRow && (g.gridCol ?? 0) === toCol
  )
  
  let originalToRow = null
  let originalToCol = null
  
  if (toGroup) {
    originalToRow = toGroup.gridRow
    originalToCol = toGroup.gridCol
    toGroup.gridRow = originalFromRow ?? 0
    toGroup.gridCol = originalFromCol ?? 0
  }
  
  fromGroup.gridRow = toRow
  fromGroup.gridCol = toCol
  compactColumns(board)
  
  try {
    // Update both groups on server
    if (toGroup) {
      await api.patch(`/groups/${toGroup.id}`, { gridRow: toGroup.gridRow, gridCol: toGroup.gridCol })
    }
    await api.patch(`/groups/${fromGroup.id}`, { gridRow: fromGroup.gridRow, gridCol: fromGroup.gridCol })
  } catch (err) {
    // Rollback on error
    console.error('Failed to move group to grid:', err)
    fromGroup.gridRow = originalFromRow
    fromGroup.gridCol = originalFromCol
    if (toGroup) {
      toGroup.gridRow = originalToRow
      toGroup.gridCol = originalToCol
    }
    compactColumns(board)
    throw err
  }
}

export async function updateGroup(groupId, data) {
  const board = b(); if (!board) return
  const group = board.groups.find(g => g.id === groupId)
  if (!group) return
  Object.assign(group, data)
  await api.patch(`/groups/${groupId}`, data)
}

export async function deleteGroup(groupId) {
  const board = b(); if (!board) return
  const idx = board.groups.findIndex((g) => g.id === groupId)
  if (idx === -1) return
  board.backlog.push(...board.groups[idx].tasks)
  board.groups.splice(idx, 1)
  await api.delete(`/groups/${groupId}`)
}

export async function archiveGroup(groupId) {
  const board = b(); if (!board) return
  const idx = board.groups.findIndex(g => g.id === groupId)
  if (idx === -1) return
  if (!board.archivedGroups) board.archivedGroups = []
  const [group] = board.groups.splice(idx, 1)
  group.archivedAt = new Date().toISOString()
  board.archivedGroups.push(group)
  await api.post(`/groups/${groupId}/archive`)
}

export async function restoreGroup(groupId) {
  const board = b(); if (!board) return
  if (!board.archivedGroups) return
  const idx = board.archivedGroups.findIndex(g => g.id === groupId)
  if (idx === -1) return
  const [group] = board.archivedGroups.splice(idx, 1)
  delete group.archivedAt
  board.groups.push(group)
  await api.post(`/groups/${groupId}/restore`)
}

export async function deleteArchivedGroup(groupId) {
  const board = b(); if (!board) return
  if (!board.archivedGroups) return
  const idx = board.archivedGroups.findIndex(g => g.id === groupId)
  if (idx !== -1) {
    board.archivedGroups.splice(idx, 1)
    await api.delete(`/groups/${groupId}`)
  }
}

export function reorderGroups(fromGroupId, toGroupId) {
  const board = b(); if (!board) return
  const fromIdx = board.groups.findIndex(g => g.id === fromGroupId)
  const toIdx   = board.groups.findIndex(g => g.id === toGroupId)
  if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return
  const [group] = board.groups.splice(fromIdx, 1)
  board.groups.splice(toIdx, 0, group)
}

export async function renameGroup(groupId, newName) {
  const group = b()?.groups.find((g) => g.id === groupId)
  if (group) {
    group.name = newName
    await api.patch(`/groups/${groupId}`, { name: newName })
  }
}

/* -- Task actions -- */
export async function createTask(data, targetType, targetId) {
  const board = b(); if (!board) return

  const payload = {
    text: data.text,
    description: data.description || '',
    status: data.status || 'not_started',
    priority: data.priority || 'medium',
    deadline: data.deadline || null,
    duration: data.duration || null,
    labelIds: data.labelIds || [],
    assigneeIds: data.assigneeIds || [],
    mainColor: data.mainColor || null,
    color: data.color || null,
    calendarColor: data.calendarColor || null,
    groupId: (targetType === 'group' && targetId != null) ? targetId : null,
  }

  try {
    const task = await api.post(`/projects/${board.id}/tasks`, payload)
    task.notes = task.notes || []
    task.comments = task.comments || []
    task.attachments = task.attachments || []

    if (targetType === 'group' && targetId != null) {
      const group = board.groups.find(g => g.id === targetId)
      if (group) {
        group.tasks.push(task)
        logActivity(board.id, 'task_added', `${actor()} added task "${data.text}"`)
        return task
      }
    }
    board.backlog.push(task)
    logActivity(board.id, 'task_added', `${actor()} added task "${data.text}"`)
    return task
  } catch (err) {
    console.error('Failed to create task:', err)
    throw err
  }
}

export async function updateTask(taskId, data) {
  const board = b(); if (!board) return
  const task = findTask(taskId)
  if (!task) return
  const name = task.text
  
  try {
    if (data.labelIds && JSON.stringify(data.labelIds) !== JSON.stringify(task.labelIds))
      logActivity(board.id, 'labels_changed', `${actor()} changed labels on "${name}"`)
    if ('deadline' in data && data.deadline !== task.deadline)
      logActivity(board.id, 'deadline_changed', `${actor()} updated deadline on "${name}"`)
    if ('status' in data && data.status !== task.status) {
      logActivity(board.id, 'status_changed', `${actor()} marked "${name}" as ${STATUS_META[data.status]?.label ?? data.status}`)
    }
    Object.assign(task, data)
    await api.patch(`/tasks/${taskId}`, data)
  } catch (err) {
    console.error('Failed to update task:', err)
    throw err
  }
}

export async function deleteTask(taskId, source, groupId) {
  const board = b(); if (!board) return
  const task = findTask(taskId)
  if (!task) return
  
  const taskName = task?.text || 'a task'
  // Store state for potential rollback
  const originalTask = { ...task }
  let wasRemoved = false
  
  try {
    if (source === 'backlog') {
      const idx = board.backlog.findIndex((t) => t.id === taskId)
      if (idx !== -1) {
        board.backlog.splice(idx, 1)
        wasRemoved = true
      }
    } else if (source === 'archived-group' && groupId != null) {
      const group = board.groups.find((g) => g.id === groupId)
      if (group && Array.isArray(group.archivedTasks)) {
        const idx = group.archivedTasks.findIndex((t) => t.id === taskId)
        if (idx !== -1) {
          group.archivedTasks.splice(idx, 1)
          wasRemoved = true
        }
      }
    } else if (source === 'group' && groupId != null) {
      const group = board.groups.find((g) => g.id === groupId)
      if (group) {
        const idx = group.tasks.findIndex((t) => t.id === taskId)
        if (idx !== -1) {
          group.tasks.splice(idx, 1)
          wasRemoved = true
        }
      }
    } else {
      const bi = board.backlog.findIndex((t) => t.id === taskId)
      if (bi !== -1) {
        board.backlog.splice(bi, 1)
        wasRemoved = true
      } else {
        for (const g of board.groups) {
          const ti = g.tasks.findIndex((t) => t.id === taskId)
          if (ti !== -1) { 
            g.tasks.splice(ti, 1)
            wasRemoved = true
            break 
          }
        }
      }
    }
    
    logActivity(board.id, 'task_deleted', `${actor()} deleted task "${taskName}"`)
    await api.delete(`/tasks/${taskId}`)
  } catch (err) {
    console.error('Failed to delete task:', err)
    // Rollback the deletion if API call failed
    if (wasRemoved) {
      if (source === 'backlog') {
        board.backlog.push(task)
      } else if (source === 'archived-group' && groupId != null) {
        const group = board.groups.find((g) => g.id === groupId)
        if (group) {
          if (!Array.isArray(group.archivedTasks)) group.archivedTasks = []
          group.archivedTasks.push(task)
        }
      } else if (source === 'group' && groupId != null) {
        const group = board.groups.find((g) => g.id === groupId)
        if (group) {
          group.tasks.push(task)
        }
      }
    }
    throw err
  }
}

export async function archiveTask(taskId, source = 'group', groupId = null) {
  const board = b(); if (!board) return

  let task = null
  let originGroup = null

  if (source === 'backlog') {
    const idx = board.backlog.findIndex((t) => t.id === taskId)
    if (idx !== -1) task = board.backlog.splice(idx, 1)[0]
  } else {
    const group = groupId != null
      ? board.groups.find((g) => g.id === groupId)
      : board.groups.find((g) => g.tasks.some((t) => t.id === taskId))
    if (group) {
      const idx = group.tasks.findIndex((t) => t.id === taskId)
      if (idx !== -1) {
        task = group.tasks.splice(idx, 1)[0]
        originGroup = group
      }
    }
  }

  if (!task) return

  task.archivedAt = new Date().toISOString()

  if (originGroup) {
    if (!Array.isArray(originGroup.archivedTasks)) originGroup.archivedTasks = []
    originGroup.archivedTasks.unshift(task)
  }

  try {
    await api.post(`/tasks/${taskId}/archive`)
  } catch (err) {
    if (originGroup) {
      originGroup.archivedTasks = (originGroup.archivedTasks || []).filter((t) => t.id !== taskId)
      originGroup.tasks.push(task)
    } else {
      board.backlog.push(task)
    }
    delete task.archivedAt
    throw err
  }
}

export async function restoreTask(taskId, groupId) {
  const board = b(); if (!board) return
  const group = board.groups.find((g) => g.id === groupId)
  if (!group || !Array.isArray(group.archivedTasks)) return

  const idx = group.archivedTasks.findIndex((t) => t.id === taskId)
  if (idx === -1) return

  const task = group.archivedTasks.splice(idx, 1)[0]
  delete task.archivedAt
  group.tasks.push(task)

  try {
    await api.post(`/tasks/${taskId}/restore`)
  } catch (err) {
    group.tasks = group.tasks.filter((t) => t.id !== taskId)
    task.archivedAt = new Date().toISOString()
    group.archivedTasks.unshift(task)
    throw err
  }
}

export async function addComment(taskId, text) {
  const board = b(); if (!board) return
  const task = findTask(taskId)
  if (!task) return
  
  try {
    const comment = await api.post(`/tasks/${taskId}/comments`, { text })
    task.comments = task.comments || []
    task.comments.push(comment)
    logActivity(board.id, 'comment_added', `${actor()} commented on "${task.text}"`)
    return comment
  } catch (err) {
    console.error('Failed to add comment:', err)
    throw err
  }
}

export async function pinComment(taskId, commentId) {
  const task = findTask(taskId)
  if (!task) return
  const c = task.comments.find(c => c.id === commentId)
  if (!c) return
  
  const originalPinned = c.pinned
  try {
    const res = await api.patch(`/comments/${commentId}/pin`)
    c.pinned = res.pinned
    return c
  } catch (err) {
    console.error('Failed to pin comment:', err)
    c.pinned = originalPinned
    throw err
  }
}

export async function deleteComment(taskId, commentId) {
  const task = findTask(taskId)
  if (!task) return
  const idx = task.comments.findIndex(c => c.id === commentId)
  if (idx === -1) return
  
  const removedComment = task.comments[idx]
  try {
    task.comments.splice(idx, 1)
    await api.delete(`/comments/${commentId}`)
  } catch (err) {
    console.error('Failed to delete comment:', err)
    task.comments.splice(idx, 0, removedComment)
    throw err
  }
}

export async function editComment(taskId, commentId, newText) {
  const task = findTask(taskId)
  if (!task) return
  const c = task.comments.find(c => c.id === commentId)
  if (!c) return
  
  const originalText = c.text
  const originalEditedAt = c.editedAt
  try {
    const res = await api.patch(`/comments/${commentId}`, { text: newText })
    c.text = res.text
    c.editedAt = res.editedAt
    return c
  } catch (err) {
    console.error('Failed to edit comment:', err)
    c.text = originalText
    c.editedAt = originalEditedAt
    throw err
  }
}

/* -- Note actions -- */
export async function addNote(taskId, noteData) {
  const board = b(); if (!board) return
  const task = findTask(taskId)
  if (!task) return
  
  try {
    if (!task.notes) task.notes = []
    const note = await api.post(`/tasks/${taskId}/notes`, noteData)
    task.notes.push(note)
    return note
  } catch (err) {
    console.error('Failed to add note:', err)
    throw err
  }
}

export async function updateNote(taskId, noteId, updates) {
  const task = findTask(taskId)
  if (!task?.notes) return
  const note = task.notes.find(n => n.id === noteId)
  if (!note) return
  
  const originalNote = { ...note }
  try {
    const res = await api.patch(`/notes/${noteId}`, updates)
    Object.assign(note, res)
    return note
  } catch (err) {
    console.error('Failed to update note:', err)
    Object.assign(note, originalNote)
    throw err
  }
}

export async function deleteNote(taskId, noteId) {
  const task = findTask(taskId)
  if (!task?.notes) return
  const idx = task.notes.findIndex(n => n.id === noteId)
  if (idx === -1) return
  
  const removedNote = task.notes[idx]
  try {
    task.notes.splice(idx, 1)
    await api.delete(`/notes/${noteId}`)
  } catch (err) {
    console.error('Failed to delete note:', err)
    task.notes.splice(idx, 0, removedNote)
    throw err
  }
}

/* -- Label actions -- */
export async function createLabel(name, color) {
  const board = b(); if (!board) return
  const label = await api.post(`/projects/${board.id}/labels`, { name, color })
  board.labels.push(label)
}

export async function updateLabel(labelId, name, color) {
  const board = b(); if (!board) return
  const label = board.labels.find((l) => l.id === labelId)
  if (!label) return
  
  const originalLabel = { ...label }
  try {
    const res = await api.patch(`/labels/${labelId}`, { name, color })
    label.name = res.name || name
    label.color = res.color || color
    return label
  } catch (err) {
    console.error('Failed to update label:', err)
    Object.assign(label, originalLabel)
    throw err
  }
}

export async function deleteLabel(labelId) {
  const board = b(); if (!board) return
  const idx = board.labels.findIndex((l) => l.id === labelId)
  if (idx === -1) return

  const removedLabel = board.labels[idx]
  const taskLabelUpdates = []

  try {
    board.labels.splice(idx, 1)

    const all = [...board.backlog, ...board.groups.flatMap((g) => g.tasks)]
    for (const task of all) {
      if (task.labelIds && Array.isArray(task.labelIds)) {
        const originalLabelIds = [...task.labelIds]
        task.labelIds = task.labelIds.filter((id) => id !== labelId)
        if (originalLabelIds.length !== task.labelIds.length) {
          taskLabelUpdates.push({ task, originalLabelIds })
        }
      }
    }

    await api.delete(`/labels/${labelId}`)
  } catch (err) {
    console.error('Failed to delete label:', err)
    board.labels.splice(idx, 0, removedLabel)
    // Rollback task label updates
    for (const { task, originalLabelIds } of taskLabelUpdates) {
      task.labelIds = originalLabelIds
    }
    throw err
  }
}

/* -- Drag & Drop -- */
export async function moveTaskToGroup(taskId, targetGroupId) {
  const board = b(); if (!board) return
  let task = null
  const backlogIdx = board.backlog.findIndex((t) => t.id === taskId)
  if (backlogIdx !== -1) {
    task = board.backlog.splice(backlogIdx, 1)[0]
  } else {
    for (const group of board.groups) {
      const idx = group.tasks.findIndex((t) => t.id === taskId)
      if (idx !== -1) { task = group.tasks.splice(idx, 1)[0]; break }
    }
  }
  if (task) {
    const targetGroup = board.groups.find((g) => g.id === targetGroupId)
    if (targetGroup) {
      targetGroup.tasks.push(task)
      await api.patch(`/tasks/${taskId}/move`, { groupId: targetGroupId })
    }
  }
}

export async function moveTaskToBacklog(taskId) {
  const board = b(); if (!board) return
  for (const group of board.groups) {
    const idx = group.tasks.findIndex((t) => t.id === taskId)
    if (idx !== -1) {
      const task = group.tasks.splice(idx, 1)[0]
      board.backlog.push(task)
      await api.patch(`/tasks/${taskId}/move`, { groupId: null })
      return
    }
  }
}

export const archivedTasks  = computed(() => b()?.archivedTasks ?? [])
