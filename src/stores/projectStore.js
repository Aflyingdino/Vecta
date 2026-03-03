import { reactive, computed } from 'vue'
import { user } from './authStore'

/* ─────────────────────────────────────────────
   Project Store — multi-project state
   Delegates to boardStore via activeProject ref.
   API_CALL markers = future FastAPI endpoints.
───────────────────────────────────────────── */

const PROJECT_COLORS = [
  '#5b5bd6', '#46a758', '#f5c842', '#e5484d',
  '#f76b15', '#0ea5e9', '#8b5cf6', '#ec4899',
]

let _pid = 10
let _gid = 10
let _tid = 10
let _lid = 10
let _cid = 10
let _mid = 10
let _aid = 10
let _nid = 10

function _id(counter) {
  // Use module-level counters; will be replaced by server-assigned IDs
  switch (counter) {
    case 'p': return _pid++
    case 'g': return _gid++
    case 't': return _tid++
    case 'l': return _lid++
    case 'c': return _cid++
    case 'm': return _mid++
    case 'n': return _nid++
  }
}

function _newProject(name, description = '', color = PROJECT_COLORS[0]) {
  return {
    id: _id('p'),
    name,
    description,
    color,
    role: 'owner',           // current user's role in this project
    members: [],             // { id, name, email, avatar, role }
    groups: [],              // kanban columns
    backlog: [],             // unassigned tasks
    labels: [],              // project-level labels
    shareId: null,           // public read-only share token
    completedTasks: [],      // archived done tasks
    activity: [],            // activity log entries
    createdAt: new Date().toISOString(),
  }
}

// ─── Seed state ───────────────────────────────
const _state = reactive({
  projects: [],
  activeProjectId: null,
  loading: false,
  error: null,
})

// Restore from localStorage
const _saved = localStorage.getItem('tp_projects')
if (_saved) {
  try {
    const parsed = JSON.parse(_saved)
    _state.projects = parsed.projects || []
    // Sync ID counters
    if (parsed._counters) {
      _pid = parsed._counters.p
      _gid = parsed._counters.g
      _tid = parsed._counters.t
      _lid = parsed._counters.l
      _cid = parsed._counters.c
      _mid = parsed._counters.m
      _aid = parsed._counters.a || _aid
      _nid = parsed._counters.n || _nid
    }
  } catch { /* invalid stored data */ }
}

function _persist() {
  localStorage.setItem('tp_projects', JSON.stringify({
    projects: _state.projects,
    _counters: { p: _pid, g: _gid, t: _tid, l: _lid, c: _cid, m: _mid, a: _aid, n: _nid },
  }))
}

// ─── Getters ───────────────────────────────────
export const projects = computed(() => _state.projects.filter(p => !p.archived))
export const archivedProjects = computed(() => _state.projects.filter(p => !!p.archived))
export const activeProjectId = computed(() => _state.activeProjectId)
export const activeProject = computed(() =>
  _state.projects.find(p => p.id === _state.activeProjectId && !p.archived) ?? null
)
export const projectsLoading = computed(() => _state.loading)

/* ─── Project actions ─────────────────────── */
export async function fetchProjects() {
  // API_CALL: GET /api/projects
  // const res = await fetch('/api/projects', { headers: authHeaders() })
  // _state.projects = await res.json()
  // (already loaded from localStorage in mock)
}

export function createProject(name, description = '', color = null) {
  const project = _newProject(
    name,
    description,
    color || PROJECT_COLORS[_state.projects.length % PROJECT_COLORS.length]
  )
  // Seed current user as owner member
  project.members.push({
    id: _id('m'),
    name: user.name || 'You',
    email: user.email || '',
    avatar: user.avatar || null,
    role: 'owner',
  })
  _state.projects.push(project)
  _persist()
  // API_CALL: POST /api/projects { name, description, color }
  return project
}

export function updateProject(projectId, updates) {
  const p = _state.projects.find(p => p.id === projectId)
  if (p) {
    Object.assign(p, updates)
    _persist()
  }
  // API_CALL: PATCH /api/projects/:projectId
}

export function deleteProject(projectId) {
  const idx = _state.projects.findIndex(p => p.id === projectId)
  if (idx !== -1) {
    _state.projects.splice(idx, 1)
    if (_state.activeProjectId === projectId) _state.activeProjectId = null
    _persist()
  }
  // API_CALL: DELETE /api/projects/:projectId
}

export function archiveProject(projectId) {
  const p = _state.projects.find(p => p.id === projectId)
  if (p) {
    p.archived = true
    p.archivedAt = new Date().toISOString()
    if (_state.activeProjectId === projectId) _state.activeProjectId = null
    _persist()
  }
}

export function restoreProject(projectId) {
  const p = _state.projects.find(p => p.id === projectId)
  if (p) {
    p.archived = false
    delete p.archivedAt
    _persist()
  }
}

export function deleteArchivedProject(projectId) {
  const idx = _state.projects.findIndex(p => p.id === projectId && p.archived)
  if (idx !== -1) {
    _state.projects.splice(idx, 1)
    _persist()
  }
}

export function setActiveProject(projectId) {
  _state.activeProjectId = projectId
}

export function reorderProjects(fromId, toId) {
  const list = _state.projects
  const fromIdx = list.findIndex(p => p.id === fromId)
  const toIdx   = list.findIndex(p => p.id === toId)
  if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return
  const [removed] = list.splice(fromIdx, 1)
  list.splice(toIdx, 0, removed)
  _persist()
}

/* ─── Member actions ─────────────────────── */
export function addMember(projectId, email, role = 'user') {
  const p = _state.projects.find(p => p.id === projectId)
  if (!p) return
  if (p.members.find(m => m.email === email)) return
  p.members.push({ id: _id('m'), name: email, email, avatar: null, role })
  _persist()
  // API_CALL: POST /api/projects/:projectId/members { email, role }
}

export function removeMember(projectId, memberId) {
  const p = _state.projects.find(p => p.id === projectId)
  if (!p) return
  const idx = p.members.findIndex(m => m.id === memberId)
  if (idx !== -1) { p.members.splice(idx, 1); _persist() }
  // API_CALL: DELETE /api/projects/:projectId/members/:memberId
}

export function updateMemberRole(projectId, memberId, role) {
  const p = _state.projects.find(p => p.id === projectId)
  const m = p?.members.find(m => m.id === memberId)
  if (m) { m.role = role; _persist() }
  // API_CALL: PATCH /api/projects/:projectId/members/:memberId { role }
}

/* ─── Share link ─────────────────────────── */
export function generateShareLink(projectId) {
  const p = _state.projects.find(p => p.id === projectId)
  if (!p) return null
  p.shareId = Math.random().toString(36).slice(2, 10)
  _persist()
  // API_CALL: POST /api/projects/:projectId/share
  return p.shareId
}

export function revokeShareLink(projectId) {
  const p = _state.projects.find(p => p.id === projectId)
  if (p) { p.shareId = null; _persist() }
  // API_CALL: DELETE /api/projects/:projectId/share
}

/* ─── Calendar scheduling ─────────────────── */
export function scheduleTask(projectId, taskId, calendarStart, calendarDuration) {
  const p = _state.projects.find(p => p.id === projectId)
  if (!p) return
  const all = [...p.backlog, ...p.groups.flatMap(g => g.tasks)]
  const task = all.find(t => t.id === taskId)
  if (task) {
    task.calendarStart    = calendarStart    // ISO string
    task.calendarDuration = calendarDuration // minutes
    _persist()
  }
  // API_CALL: PATCH /api/projects/:projectId/tasks/:taskId/schedule { calendarStart, calendarDuration }
}

export function unscheduleTask(projectId, taskId) {
  const p = _state.projects.find(p => p.id === projectId)
  if (!p) return
  const all = [...p.backlog, ...p.groups.flatMap(g => g.tasks)]
  const task = all.find(t => t.id === taskId)
  if (task) { task.calendarStart = null; task.calendarDuration = null; _persist() }
}

/* ─── Activity log ──────────────────────────── */
export function logActivity(projectId, type, message) {
  const p = _state.projects.find(p => p.id === projectId)
  if (!p) return
  if (!p.activity) p.activity = []
  p.activity.unshift({
    id: _aid++,
    type,      // 'task_added' | 'task_deleted' | 'status_changed' | 'labels_changed'
               // | 'deadline_changed' | 'comment_added'
    message,   // human-readable string
    projectId,
    projectName: p.name,
    projectColor: p.color,
    createdAt: new Date().toISOString(),
  })
  // Keep max 200 entries per project to avoid bloat
  if (p.activity.length > 200) p.activity.length = 200
  _persist()
}

/* ─── Board mutation helpers (called by boardStore) ─── */
export function _nextGroupId()   { return _gid++ }
export function _nextTaskId()    { return _tid++ }
export function _nextLabelId()   { return _lid++ }
export function _nextCommentId() { return _cid++ }
export function _nextNoteId()    { return _nid++ }
export function _save()          { _persist() }
