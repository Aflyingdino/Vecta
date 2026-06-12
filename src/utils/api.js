<<<<<<< Updated upstream
=======
import { getDemoToken, isDemoModeEnabled, readDemoState, resetDemoState, writeDemoState } from './demoMode'
import { getPlan } from './subscriptionPlans'

>>>>>>> Stashed changes
const DEFAULT_API_BASE = '/api/index.php'
const envApiBase = (import.meta.env.VITE_API_BASE || '').trim()

function withLeadingSlash(value) {
  if (!value) return ''
  return value.startsWith('/') ? value : `/${value}`
}

function withoutTrailingSlash(value) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

const BASE = withoutTrailingSlash(withLeadingSlash(envApiBase || DEFAULT_API_BASE))
const FALLBACK_BASE = BASE
const CSRF_HEADER = 'X-CSRF-Token'
const PLAN_KEYS = new Set(['free', 'standard', 'premium', 'premium_plus', 'enterprise'])

let csrfToken = null
let csrfPromise = null
let useFallbackRouting = false

<<<<<<< Updated upstream
=======
function clone(value) {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value))
}

function nextId(state, key) {
  const current = state.nextIds?.[key] ?? 1
  state.nextIds[key] = current + 1
  return current
}

function ensureDemoState() {
  return readDemoState() || resetDemoState()
}

function demoCurrentUser() {
  return clone(ensureDemoState().currentUser)
}

function demoProjectSummary(project) {
  return clone(project)
}

function findProject(state, projectId) {
  return state.projects.find((project) => project.id === projectId) || null
}

function findGroup(state, groupId) {
  for (const project of state.projects) {
    const group = project.groups.find((item) => item.id === groupId)
    if (group) return { project, group }
  }
  return null
}

function findTask(state, taskId) {
  for (const project of state.projects) {
    const backlogTask = project.backlog.find((item) => item.id === taskId)
    if (backlogTask) return { project, container: project.backlog, task: backlogTask }
    for (const group of project.groups) {
      const groupTask = group.tasks.find((item) => item.id === taskId)
      if (groupTask) return { project, container: group.tasks, task: groupTask, group }
      if (Array.isArray(group.archivedTasks)) {
        const archivedTask = group.archivedTasks.find((item) => item.id === taskId)
        if (archivedTask) return { project, container: group.archivedTasks, task: archivedTask, group, archived: true }
      }
    }
  }
  return null
}

function makeTaskFromBody(state, body, taskId = nextId(state, 'task')) {
  return {
    id: taskId,
    text: body.text || 'Nieuwe taak',
    description: body.description || '',
    status: body.status || 'not_started',
    priority: body.priority || 'medium',
    deadline: body.deadline || null,
    duration: body.duration || null,
    labelIds: Array.isArray(body.labelIds) ? [...body.labelIds] : [],
    assigneeIds: Array.isArray(body.assigneeIds) ? [...body.assigneeIds] : [],
    mainColor: body.mainColor || null,
    color: body.color || null,
    calendarColor: body.calendarColor || null,
    comments: [],
    notes: [],
    attachments: [],
  }
}

function makeGroupFromBody(state, body, groupId = nextId(state, 'group')) {
  return {
    id: groupId,
    name: body.name || 'New Group',
    description: body.description || '',
    deadline: body.deadline || null,
    priority: body.priority || 'medium',
    status: body.status || 'not_started',
    labelIds: Array.isArray(body.labelIds) ? [...body.labelIds] : [],
    color: body.color ?? null,
    mainColor: body.mainColor ?? null,
    gridRow: body.gridRow ?? 0,
    gridCol: body.gridCol ?? 0,
    tasks: [],
    archivedTasks: [],
  }
}

function makeProjectFromBody(state, body, projectId = nextId(state, 'project')) {
  return {
    id: projectId,
    name: body.name || 'Nieuw project',
    description: body.description || '',
    color: body.color || '#5b5bd6',
    role: 'owner',
    archived: false,
    archivedAt: null,
    shareId: null,
    members: [
      {
        id: nextId(state, 'member'),
        name: state.currentUser.name,
        email: state.currentUser.email,
        role: 'owner',
      },
    ],
    labels: [],
    backlog: [],
    groups: [],
    archivedGroups: [],
    archivedTasks: [],
    activity: [],
  }
}

function demoRespond(data, status = 200) {
  return Promise.resolve(clone(data))
}

function demoError(message, status = 400) {
  return Promise.reject(new Error(message || `Request failed (${status})`))
}

function normalizePlanKey(plan) {
  const value = String(plan || 'free').trim().toLowerCase()
  return PLAN_KEYS.has(value) ? value : 'free'
}

function addPlanDuration(planKey, fromDate = new Date()) {
  const durationDays = getPlan(planKey).durationDays
  if (!durationDays) return null
  const date = new Date(fromDate)
  date.setDate(date.getDate() + durationDays)
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

function persistDemoState(state) {
  writeDemoState(state)
  return state
}

async function handleDemoRequest(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const body = options.body ? JSON.parse(options.body) : {}
  const state = ensureDemoState()

  if (path === '/csrf' && method === 'GET') {
    return demoRespond({ token: getDemoToken() })
  }

  if (path === '/auth/me' && method === 'GET') {
    return demoRespond({ ...demoCurrentUser(), createdAt: new Date().toISOString() })
  }

  if (path === '/auth/subscription' && method === 'PATCH') {
    const plan = normalizePlanKey(body?.subscriptionPlan)
    const currentPlan = normalizePlanKey(state.currentUser.subscriptionPlan)
    const now = new Date()
    const activeUntil = state.currentUser.subscriptionExpiresAt ? new Date(state.currentUser.subscriptionExpiresAt) : null
    const isCurrentPaidAndActive = currentPlan !== 'free' && activeUntil && activeUntil > now

    if (currentPlan === 'free' || !isCurrentPaidAndActive) {
      state.currentUser.subscriptionPlan = plan
      state.currentUser.subscriptionStartedAt = now.toISOString().slice(0, 19).replace('T', ' ')
      state.currentUser.subscriptionExpiresAt = addPlanDuration(plan, now)
      state.currentUser.subscriptionNextPlan = null
      state.currentUser.subscriptionNextStartsAt = null
      state.currentUser.subscriptionNextExpiresAt = null
      for (const project of state.projects) {
        const member = project.members.find((item) => item.id === state.currentUser.id)
        if (member) member.subscriptionPlan = plan
      }
    } else {
      state.currentUser.subscriptionNextPlan = plan
      state.currentUser.subscriptionNextStartsAt = state.currentUser.subscriptionExpiresAt
      state.currentUser.subscriptionNextExpiresAt = addPlanDuration(plan, state.currentUser.subscriptionExpiresAt ? new Date(state.currentUser.subscriptionExpiresAt) : now)
    }

    persistDemoState(state)
    return demoRespond({ ...demoCurrentUser() })
  }

  if (path === '/auth/login' && method === 'POST') {
    if (body.email === 'demo@vecta.local' && body.password === 'vecta-demo-2026') {
      return demoRespond({ ...demoCurrentUser(), csrfToken: getDemoToken() })
    }
    return demoError('Invalid email or password', 401)
  }

  if (path === '/auth/register' && method === 'POST') {
    const subscriptionPlan = normalizePlanKey(body.subscriptionPlan)
    state.currentUser = {
      id: 1,
      name: body.name || 'Demo gebruiker',
      email: body.email || 'demo@vecta.local',
      subscriptionPlan,
      subscriptionStartedAt: subscriptionPlan === 'free' ? null : new Date().toISOString().slice(0, 19).replace('T', ' '),
      subscriptionExpiresAt: subscriptionPlan === 'free' ? null : addPlanDuration(subscriptionPlan),
      subscriptionNextPlan: null,
      subscriptionNextStartsAt: null,
      subscriptionNextExpiresAt: null,
    }
    persistDemoState(state)
    return demoRespond({ ...demoCurrentUser(), csrfToken: getDemoToken() }, 201)
  }

  if (path === '/auth/logout' && method === 'POST') {
    return demoRespond({ message: 'Logged out' })
  }

  if (path === '/projects' && method === 'GET') {
    return demoRespond(state.projects.map(demoProjectSummary))
  }

  if (path === '/projects' && method === 'POST') {
    const project = makeProjectFromBody(state, body)
    state.projects.push(project)
    persistDemoState(state)
    return demoRespond(project, 201)
  }

  const projectMatch = path.match(/^\/projects\/(\d+)(?:\/(archive|restore|members|labels|groups|tasks|share|activity))?(?:\/(\d+))?(?:\/(members|archive|restore|move|schedule|comments|notes|pin))?$/)
  if (projectMatch) {
    const projectId = Number(projectMatch[1])
    const action = projectMatch[2] || ''
    const subId = projectMatch[3] ? Number(projectMatch[3]) : null
    const subAction = projectMatch[4] || ''
    const project = findProject(state, projectId)
    if (!project) return demoError('Project not found', 404)

    if (!action) {
      if (method === 'GET') return demoRespond(project)
      if (method === 'PATCH') {
        Object.assign(project, body)
        persistDemoState(state)
        return demoRespond(project)
      }
      if (method === 'DELETE') {
        state.projects = state.projects.filter((item) => item.id !== projectId)
        persistDemoState(state)
        return demoRespond({ message: 'Deleted' })
      }
    }

    if (action === 'archive' && method === 'POST') {
      project.archived = true
      project.archivedAt = new Date().toISOString()
      persistDemoState(state)
      return demoRespond(project)
    }

    if (action === 'restore' && method === 'POST') {
      project.archived = false
      project.archivedAt = null
      persistDemoState(state)
      return demoRespond(project)
    }

    if (action === 'groups' && method === 'POST') {
      const group = makeGroupFromBody(state, body)
      project.groups.push(group)
      persistDemoState(state)
      return demoRespond(group, 201)
    }

    if (action === 'labels' && method === 'POST') {
      const label = {
        id: nextId(state, 'label'),
        name: body.name || 'Label',
        color: body.color || '#5b5bd6',
      }
      project.labels.push(label)
      persistDemoState(state)
      return demoRespond(label, 201)
    }

    if (action === 'tasks' && method === 'POST') {
      const task = makeTaskFromBody(state, body)
      const targetGroup = body.groupId != null ? project.groups.find((group) => group.id === Number(body.groupId)) : null
      if (targetGroup) targetGroup.tasks.push(task)
      else project.backlog.push(task)
      persistDemoState(state)
      return demoRespond(task, 201)
    }

    if (action === 'share') {
      if (method === 'POST') {
        project.shareId = `demo-${project.id}`
        persistDemoState(state)
        return demoRespond({ shareId: project.shareId })
      }
      if (method === 'DELETE') {
        project.shareId = null
        persistDemoState(state)
        return demoRespond({ message: 'Deleted' })
      }
    }

    if (action === 'activity' && method === 'GET') {
      return demoRespond(project.activity || [])
    }

    if (action === 'members' && method === 'POST') {
      const member = {
        id: nextId(state, 'member'),
        name: body.name || body.email || 'Demo lid',
        email: body.email || 'member@vecta.local',
        role: body.role || 'collaborator',
        subscriptionPlan: body.subscriptionPlan || 'free',
      }
      project.members.push(member)
      persistDemoState(state)
      return demoRespond(member, 201)
    }
  }

  const groupMatch = path.match(/^\/groups\/(\d+)(?:\/(archive|restore))?$/)
  if (groupMatch) {
    const groupId = Number(groupMatch[1])
    const action = groupMatch[2] || ''
    const result = findGroup(state, groupId)
    if (!result) return demoError('Group not found', 404)
    const { project, group } = result

    if (!action && method === 'PATCH') {
      Object.assign(group, body)
      persistDemoState(state)
      return demoRespond(group)
    }

    if (!action && method === 'DELETE') {
      project.groups = project.groups.filter((item) => item.id !== groupId)
      persistDemoState(state)
      return demoRespond({ message: 'Deleted' })
    }

    if (action === 'archive' && method === 'POST') {
      group.archivedAt = new Date().toISOString()
      project.archivedGroups.push(group)
      project.groups = project.groups.filter((item) => item.id !== groupId)
      persistDemoState(state)
      return demoRespond(group)
    }

    if (action === 'restore' && method === 'POST') {
      delete group.archivedAt
      project.groups.push(group)
      project.archivedGroups = project.archivedGroups.filter((item) => item.id !== groupId)
      persistDemoState(state)
      return demoRespond(group)
    }
  }

  const taskMatch = path.match(/^\/tasks\/(\d+)(?:\/(move|schedule|archive|restore|comments|notes))?(?:\/(\d+))?(?:\/(pin))?$/)
  if (taskMatch) {
    const taskId = Number(taskMatch[1])
    const action = taskMatch[2] || ''
    const extraId = taskMatch[3] ? Number(taskMatch[3]) : null
    const extraAction = taskMatch[4] || ''
    const located = findTask(state, taskId)
    if (!located) return demoError('Task not found', 404)
    const { project, task, group } = located

    if (!action && method === 'PATCH') {
      Object.assign(task, body)
      persistDemoState(state)
      return demoRespond(task)
    }

    if (!action && method === 'DELETE') {
      if (group) {
        group.tasks = group.tasks.filter((item) => item.id !== taskId)
        if (group.archivedTasks) group.archivedTasks = group.archivedTasks.filter((item) => item.id !== taskId)
      } else {
        project.backlog = project.backlog.filter((item) => item.id !== taskId)
      }
      persistDemoState(state)
      return demoRespond({ message: 'Deleted' })
    }

    if (action === 'move' && method === 'PATCH') {
      const targetGroupId = body.groupId == null ? null : Number(body.groupId)
      project.backlog = project.backlog.filter((item) => item.id !== taskId)
      for (const currentGroup of project.groups) {
        currentGroup.tasks = currentGroup.tasks.filter((item) => item.id !== taskId)
      }
      if (targetGroupId == null) {
        project.backlog.push(task)
      } else {
        const targetGroup = project.groups.find((item) => item.id === targetGroupId)
        if (targetGroup) targetGroup.tasks.push(task)
      }
      persistDemoState(state)
      return demoRespond(task)
    }

    if (action === 'schedule' && method === 'PATCH') {
      task.calendarStart = body.calendarStart || null
      task.calendarDuration = body.calendarDuration || null
      persistDemoState(state)
      return demoRespond(task)
    }

    if (action === 'schedule' && method === 'DELETE') {
      task.calendarStart = null
      task.calendarDuration = null
      persistDemoState(state)
      return demoRespond(task)
    }

    if (action === 'archive' && method === 'POST') {
      task.archivedAt = new Date().toISOString()
      if (group) {
        group.tasks = group.tasks.filter((item) => item.id !== taskId)
        group.archivedTasks = Array.isArray(group.archivedTasks) ? group.archivedTasks : []
        group.archivedTasks.unshift(task)
      } else {
        project.backlog = project.backlog.filter((item) => item.id !== taskId)
      }
      persistDemoState(state)
      return demoRespond(task)
    }

    if (action === 'restore' && method === 'POST') {
      delete task.archivedAt
      if (group) {
        group.archivedTasks = (group.archivedTasks || []).filter((item) => item.id !== taskId)
        group.tasks.push(task)
      }
      persistDemoState(state)
      return demoRespond(task)
    }

    if (action === 'comments') {
      if (method === 'POST') {
        const comment = {
          id: nextId(state, 'comment'),
          text: body.text || '',
          pinned: false,
          createdAt: new Date().toISOString(),
          editedAt: null,
        }
        task.comments = Array.isArray(task.comments) ? task.comments : []
        task.comments.push(comment)
        persistDemoState(state)
        return demoRespond(comment, 201)
      }
    }

    if (action === 'notes') {
      if (method === 'POST') {
        const note = {
          id: nextId(state, 'note'),
          ...body,
        }
        task.notes = Array.isArray(task.notes) ? task.notes : []
        task.notes.push(note)
        persistDemoState(state)
        return demoRespond(note, 201)
      }
    }
  }

  const commentMatch = path.match(/^\/comments\/(\d+)(?:\/(pin))?$/)
  if (commentMatch) {
    const commentId = Number(commentMatch[1])
    const action = commentMatch[2] || ''
    const commentLocation = (() => {
      for (const project of state.projects) {
        const allTasks = [...project.backlog, ...project.groups.flatMap((item) => item.tasks), ...project.groups.flatMap((item) => item.archivedTasks || [])]
        for (const task of allTasks) {
          const comment = (task.comments || []).find((item) => item.id === commentId)
          if (comment) return { task, comment }
        }
      }
      return null
    })()
    if (!commentLocation) return demoError('Comment not found', 404)
    const { comment } = commentLocation
    if (!action && method === 'PATCH') {
      Object.assign(comment, { text: body.text || comment.text, editedAt: new Date().toISOString() })
      persistDemoState(state)
      return demoRespond(comment)
    }
    if (!action && method === 'DELETE') {
      persistDemoState(state)
      return demoRespond({ message: 'Deleted' })
    }
    if (action === 'pin' && method === 'PATCH') {
      comment.pinned = !comment.pinned
      persistDemoState(state)
      return demoRespond(comment)
    }
  }

  const noteMatch = path.match(/^\/notes\/(\d+)$/)
  if (noteMatch && (method === 'PATCH' || method === 'DELETE')) {
    const noteId = Number(noteMatch[1])
    for (const project of state.projects) {
      for (const task of [...project.backlog, ...project.groups.flatMap((item) => item.tasks)]) {
        const note = (task.notes || []).find((item) => item.id === noteId)
        if (note) {
          if (method === 'PATCH') {
            Object.assign(note, body)
            persistDemoState(state)
            return demoRespond(note)
          }
          if (method === 'DELETE') {
            task.notes = task.notes.filter((item) => item.id !== noteId)
            persistDemoState(state)
            return demoRespond({ message: 'Deleted' })
          }
        }
      }
    }
    return demoError('Note not found', 404)
  }

  const labelMatch = path.match(/^\/labels\/(\d+)$/)
  if (labelMatch) {
    const labelId = Number(labelMatch[1])
    for (const project of state.projects) {
      const label = project.labels.find((item) => item.id === labelId)
      if (!label) continue
      if (method === 'PATCH') {
        Object.assign(label, body)
        persistDemoState(state)
        return demoRespond(label)
      }
      if (method === 'DELETE') {
        project.labels = project.labels.filter((item) => item.id !== labelId)
        persistDemoState(state)
        return demoRespond({ message: 'Deleted' })
      }
    }
    return demoError('Label not found', 404)
  }

  return demoRespond({ message: 'ok' })
}

>>>>>>> Stashed changes
function buildUrl(path) {
  if (useFallbackRouting) {
    return `${FALLBACK_BASE}?route=${encodeURIComponent(path)}`
  }
  return `${BASE}${path}`
}

async function parseJson(res) {
  return res.json().catch(() => ({}))
}

async function fetchCsrfToken(forceRefresh = false) {
  if (csrfToken && !forceRefresh) return csrfToken
  if (csrfPromise && !forceRefresh) return csrfPromise

  const run = async () => {
    const res = await fetch(buildUrl('/csrf'), {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })

    // Auto-switch to query fallback if path-info routing is unavailable.
    if (!useFallbackRouting && res.status === 404) {
      useFallbackRouting = true
      return run()
    }

    const data = await parseJson(res)
    if (!res.ok || !data.token) {
      throw new Error(data.error || `Request failed (${res.status})`)
    }
    csrfToken = data.token
    return csrfToken
  }

  csrfPromise = run().finally(() => {
    csrfPromise = null
  })

  return csrfPromise
}

async function request(path, options = {}, allowRetry = true) {
  const method = (options.method || 'GET').toUpperCase()
  const headers = { Accept: 'application/json', ...options.headers }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    headers[CSRF_HEADER] = await fetchCsrfToken()
  }

  const res = await fetch(buildUrl(path), {
    headers,
    credentials: 'include',
    ...options,
  })

  if (!useFallbackRouting && res.status === 404) {
    useFallbackRouting = true
    return request(path, options, allowRetry)
  }

  if (res.status === 204) return null

  if (res.status === 419 && allowRetry) {
    await fetchCsrfToken(true)
    return request(path, options, false)
  }

  const data = await parseJson(res)

  if (data?.csrfToken) {
    csrfToken = data.csrfToken
  }

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }

  return data
}

export const api = {
  initSecurity: () => fetchCsrfToken(),
  get:    (path) => request(path),
  post:   (path, body) => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  (path, body) => request(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
