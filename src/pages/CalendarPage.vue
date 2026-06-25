<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { projects, activeProject, setActiveProject, scheduleTask, unscheduleTask } from '@/stores/projectStore'
import { openTaskDetail } from '@/stores/uiStore'
import { updateTask } from '@/stores/boardStore'
import { formatTime } from '@/utils/dates'
import { APP_LOCALE, PRESET_COLORS } from '@/utils/constants'
import { t } from '@/utils/i18n'

/* ═══════════════════════════════════════════════
   VIEW MODE
═══════════════════════════════════════════════ */
const viewMode = ref('schedule') // 'schedule' | 'deadline'

/* ═══════════════════════════════════════════════
   SCHEDULE VIEW STATE
═══════════════════════════════════════════════ */
const hourHeight = ref(64)      // px per hour; zoom changes this
const timeGridScroll = ref(null) // template ref for scrollable grid
const isDraggingBlock = ref(false)
const lastDragEndMs = ref(0)
const activeTintTaskId = ref(null)
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const WEEK_DAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

// Current week: Monday-based
const today = new Date()
function getMondayOf(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1 - day)
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}
const weekStart = ref(getMondayOf(today))

function prevWeek() {
  const d = new Date(weekStart.value)
  d.setDate(d.getDate() - 7)
  weekStart.value = d
}
function nextWeek() {
  const d = new Date(weekStart.value)
  d.setDate(d.getDate() + 7)
  weekStart.value = d
}
function goThisWeek() { weekStart.value = getMondayOf(today) }

const isCurrentWeek = computed(() =>
  weekStart.value.toDateString() === getMondayOf(today).toDateString()
)

// The 7 days of the current week
const weekDays = computed(() => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.value)
    d.setDate(d.getDate() + i)
    return d
  })
})

const weekLabel = computed(() => {
  const s = weekDays.value[0]
  const e = weekDays.value[6]
  const fmt = d => d.toLocaleDateString(APP_LOCALE, { day: 'numeric', month: 'short' })
  return `${fmt(s)} – ${fmt(e)}, ${e.getFullYear()}`
})

function isToday(d) {
  return d.toDateString() === today.toDateString()
}

function zoomIn()  { hourHeight.value = Math.min(160, hourHeight.value + 16) }
function zoomOut() { hourHeight.value = Math.max(32, hourHeight.value - 16) }

onMounted(async () => {
  await nextTick()
  if (timeGridScroll.value) {
    timeGridScroll.value.scrollTop = 12 * hourHeight.value
  }
})

function taskEndTimeLabel(task) {
  const start = new Date(task.calendarStart)
  const startMin = start.getHours() * 60 + start.getMinutes()
  const endMin = startMin + (task.calendarDuration || 60)
  const endH = Math.floor(endMin / 60) % 24
  const endM = endMin % 60
  return String(endH).padStart(2, '0') + ':' + String(endM).padStart(2, '0')
}

/* ═══════════════════════════════════════════════
   SIDEBAR — PROJECTS & TASKS
═══════════════════════════════════════════════ */
const sidebarExpanded = ref({}) // projectId -> boolean
const projectSort = ref('name_asc')
const taskSort = ref('recent_desc')

function toggleProject(id) {
  sidebarExpanded.value[id] = !sidebarExpanded.value[id]
}

function sortTasks(tasks) {
  const list = [...tasks]
  if (taskSort.value === 'recent_desc') {
    return list.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
  }
  if (taskSort.value === 'deadline_asc') {
    return list.sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return new Date(a.deadline) - new Date(b.deadline)
    })
  }
  if (taskSort.value === 'status') {
    const rank = { not_started: 0, started: 1, ready_for_test: 1, done: 2 }
    return list.sort((a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9))
  }
  return list.sort((a, b) => a.text.localeCompare(b.text, APP_LOCALE))
}

function sortProjectsList(items) {
  const list = [...items]
  if (projectSort.value === 'tasks_desc') {
    return list.sort((a, b) => b.allTasks.length - a.allTasks.length)
  }
  if (projectSort.value === 'recent_desc') {
    return list.sort((a, b) => {
      const aLatest = Math.max(...a.allTasks.map(t => new Date(t.updatedAt || t.createdAt || 0).getTime()), 0)
      const bLatest = Math.max(...b.allTasks.map(t => new Date(t.updatedAt || t.createdAt || 0).getTime()), 0)
      return bLatest - aLatest
    })
  }
  return list.sort((a, b) => a.name.localeCompare(b.name, APP_LOCALE))
}

// All projects with their unscheduled tasks
const sidebarProjects = computed(() => {
  const mapped = projects.value
    .map(p => ({
      ...p,
      allTasks: sortTasks([
        ...p.backlog,
        ...p.groups.flatMap(g => g.tasks)
      ])
    }))
  return sortProjectsList(mapped)
})

// Check if task is overdue
function isTaskOverdue(task) {
  return task.deadline && task.status !== 'done' && new Date(task.deadline) < new Date()
}

/* ═══════════════════════════════════════════════
   DRAG FROM SIDEBAR
═══════════════════════════════════════════════ */
// Grab offset stored in a ref because dataTransfer.getData() is blocked during dragover
const dragGrabOffsetMin = ref(0)

function onTaskDragStart(event, task, project) {
  // Prevent dragging overdue tasks
  if (isTaskOverdue(task)) {
    event.preventDefault()
    return
  }
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('taskId', String(task.id))
  event.dataTransfer.setData('projectId', String(project.id))
  event.dataTransfer.setData('text/plain', JSON.stringify({ taskId: task.id, projectId: project.id }))
  dragGrabOffsetMin.value = 0
}

/* ═══════════════════════════════════════════════
   DRAG EXISTING BLOCK (move)
═══════════════════════════════════════════════ */
function onBlockDragStart(event, task) {
  // Prevent dragging overdue tasks
  if (isTaskOverdue(task)) {
    event.preventDefault()
    return
  }
  event.stopPropagation()
  isDraggingBlock.value = true
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('taskId', String(task.id))
  event.dataTransfer.setData('projectId', String(task._projectId))
  event.dataTransfer.setData('text/plain', JSON.stringify({ taskId: task.id, projectId: task._projectId }))
  // Capture where inside the block the user grabbed (in minutes)
  const rect = event.currentTarget.getBoundingClientRect()
  const grabPx = event.clientY - rect.top
  dragGrabOffsetMin.value = Math.round((grabPx / hourHeight.value) * 60 / 5) * 5
}

function onBlockDragEnd() {
  lastDragEndMs.value = Date.now()
  setTimeout(() => { isDraggingBlock.value = false }, 100)
}

/* ═══════════════════════════════════════════════
   DROP ON SCHEDULE GRID
═══════════════════════════════════════════════ */
const dragOverCell = ref(null) // { dayIndex, minute }

// Use clientY - column.getBoundingClientRect().top so position is always
// relative to the full column height regardless of which child fired the event
function minuteFromEvent(event) {
  const colRect = event.currentTarget.getBoundingClientRect()
  const rawPx   = event.clientY - colRect.top
  const rawMin  = (rawPx / hourHeight.value) * 60
  const adjusted = rawMin - dragGrabOffsetMin.value
  return Math.max(0, Math.min(23 * 60 + 55, Math.round(adjusted / 5) * 5))
}

function onDragOver(event, dayIndex) {
  event.preventDefault()
  dragOverCell.value = { dayIndex, minute: minuteFromEvent(event) }
}
function onDragLeave() { dragOverCell.value = null }

// Return all busy intervals on a given day, excluding one task (the one being dragged)
function tasksOnDay(dayDate, excludeTaskId) {
  const ds = dayDate.toDateString()
  const result = []
  for (const p of projects.value) {
    const all = [...p.backlog, ...p.groups.flatMap(g => g.tasks)]
    for (const t of all) {
      if (t.id === excludeTaskId) continue
      if (!t.calendarStart) continue
      const tDate = new Date(t.calendarStart)
      if (tDate.toDateString() !== ds) continue
      const startMin = tDate.getHours() * 60 + tDate.getMinutes()
      result.push({ startMin, endMin: startMin + (t.calendarDuration || 60) })
    }
  }
  return result
}

const SNAP_THRESHOLD_MIN = 30 // gap smaller than this snaps to neighbour

function isBeyondDeadline(task, dayDate, minute) {
  if (!task?.deadline) return false
  const dropDate = new Date(dayDate)
  dropDate.setHours(Math.floor(minute / 60), minute % 60, 0, 0)
  const deadlineEnd = new Date(task.deadline)
  deadlineEnd.setHours(23, 59, 59, 999)
  return dropDate > deadlineEnd
}

function parseDragPayload(event) {
  const rawTaskId = Number.parseInt(event.dataTransfer.getData('taskId'), 10)
  const rawProjectId = Number.parseInt(event.dataTransfer.getData('projectId'), 10)
  if (Number.isInteger(rawTaskId) && Number.isInteger(rawProjectId)) {
    return { taskId: rawTaskId, projectId: rawProjectId }
  }

  const textPayload = event.dataTransfer.getData('text/plain')
  if (!textPayload) return null

  try {
    const parsed = JSON.parse(textPayload)
    const taskId = Number.parseInt(String(parsed?.taskId ?? ''), 10)
    const projectId = Number.parseInt(String(parsed?.projectId ?? ''), 10)
    if (!Number.isInteger(taskId) || !Number.isInteger(projectId)) return null
    return { taskId, projectId }
  } catch {
    return null
  }
}

function allTasksForProject(project) {
  return [
    ...(project?.backlog ?? []),
    ...((project?.groups ?? []).flatMap(group => group.tasks ?? [])),
  ]
}

async function onDrop(event, dayDate) {
  event.preventDefault()
  dragOverCell.value = null
  const payload = parseDragPayload(event)
  if (!payload) return

  const taskId = payload.taskId
  const projectId = payload.projectId

  let minute = minuteFromEvent(event)
  const p = projects.value.find(p => p.id === projectId)
  const task = p ? allTasksForProject(p).find(task => task.id === taskId) : null
  if (!task || !Number.isFinite(minute)) {
    dragGrabOffsetMin.value = 0
    return
  }
  const duration = task?.calendarDuration ?? 60
  const others = tasksOnDay(dayDate, taskId)
  if (isBeyondDeadline(task, dayDate, minute)) {
    dragGrabOffsetMin.value = 0
    return
  }

  // ─ Snap start to adjacent task's end (gap < threshold)
  for (const o of others) {
    if (o.endMin <= minute && minute - o.endMin < SNAP_THRESHOLD_MIN) {
      minute = o.endMin
      break
    }
  }
  // ─ Snap end to adjacent task's start (gap < threshold)
  let snappedDuration = duration
  const end = minute + duration
  for (const o of others) {
    if (o.startMin >= end && o.startMin - end < SNAP_THRESHOLD_MIN) {
      snappedDuration = Math.max(5, o.startMin - minute)
      break
    }
  }

  // ─ Collision check: if any overlap exists after snapping, revert (do nothing)
  const hasCollision = others.some(
    o => minute < o.endMin && (minute + snappedDuration) > o.startMin
  )
  if (hasCollision || isBeyondDeadline(task, dayDate, minute)) {
    dragGrabOffsetMin.value = 0
    return // leave task at its original position
  }

  await scheduleTask(projectId, taskId, buildCalendarDateTime(dayDate, minute), snappedDuration)
  dragGrabOffsetMin.value = 0
}

/* ═══════════════════════════════════════════════
   SCROLL-WHEEL ZOOM
═══════════════════════════════════════════════ */
function onZoomWheel(event) {
  const delta = event.deltaY > 0 ? -16 : 16
  hourHeight.value = Math.max(32, Math.min(160, hourHeight.value + delta))
}

// Ctrl+scroll = zoom; plain scroll = native scroll
function onWheelGrid(event) {
  if (event.ctrlKey) {
    event.preventDefault()
    onZoomWheel(event)
  }
}

function snapMinute(offsetY) {
  const rawMin = (offsetY / hourHeight.value) * 60
  return Math.max(0, Math.min(23 * 60 + 55, Math.round(rawMin / 5) * 5))
}

function buildCalendarDateTime(date, minute) {
  const d = new Date(date)
  d.setHours(Math.floor(minute / 60), minute % 60, 0, 0)
  if (Number.isNaN(d.getTime())) return null
  const pad = value => String(value).padStart(2, '0')
  return [
    d.getFullYear(),
    pad(d.getMonth() + 1),
    pad(d.getDate()),
  ].join('-') + ' ' + [
    pad(d.getHours()),
    pad(d.getMinutes()),
    pad(d.getSeconds()),
  ].join(':')
}

/* ═══════════════════════════════════════════════
   SCHEDULED TASKS on GRID
═══════════════════════════════════════════════ */
function taskStyle(task) {
  const start = new Date(task.calendarStart)
  const startMin = start.getHours() * 60 + start.getMinutes()
  const dur = task.calendarDuration || 60
  return {
    top:    (startMin * hourHeight.value / 60) + 'px',
    height: Math.max(hourHeight.value / 12, dur * hourHeight.value / 60) + 'px',
  }
}

function blockHeight(task) {
  const dur = task.calendarDuration || 60
  return Math.max(hourHeight.value / 12, dur * hourHeight.value / 60)
}

// Which day column index does a task fall on?
function taskDayIndex(task) {
  const start = new Date(task.calendarStart)
  start.setHours(0, 0, 0, 0)
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart.value)
    d.setDate(d.getDate() + i)
    if (d.toDateString() === start.toDateString()) return i
  }
  return -1
}

// Gather tasks for the current week
const scheduledTasks = computed(() => {
  const res = []
  for (const p of projects.value) {
    const all = [...p.backlog, ...p.groups.flatMap(g => g.tasks)]
    for (const t of all) {
      if (!t.calendarStart) continue
      const idx = taskDayIndex(t)
      if (idx === -1) continue
      res.push({ ...t, _projectId: p.id, _projectColor: p.color, _projectName: p.name, _dayIndex: idx })
    }
  }
  return res
})

function tasksForDay(dayIndex) {
  return scheduledTasks.value.filter(t => t._dayIndex === dayIndex)
}

/* ═══════════════════════════════════════════════
   RESIZE HANDLE
═══════════════════════════════════════════════ */
function startResize(event, task) {
  event.preventDefault()
  event.stopPropagation()
  const startY = event.clientY
  const startDuration = task.calendarDuration || 60

  function onMove(e) {
    const dy = e.clientY - startY
    const minutesDelta = (dy / hourHeight.value) * 60
    const newDuration = Math.max(5, Math.round((startDuration + minutesDelta) / 5) * 5)
    // Prevent overlap
    const taskStart = new Date(task.calendarStart)
    const taskDay = new Date(taskStart); taskDay.setHours(0,0,0,0)
    const taskStartMin = taskStart.getHours() * 60 + taskStart.getMinutes()
    const others = tasksOnDay(taskDay, task.id)
    const hasCollision = others.some(o => taskStartMin < o.endMin && (taskStartMin + newDuration) > o.startMin)
    if (!hasCollision) scheduleTask(task._projectId, task.id, task.calendarStart, newDuration)
  }
  function onUp() {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

// Top resize handle: drag to move start time, keeping end time fixed
function startTopResize(event, task) {
  event.preventDefault()
  event.stopPropagation()
  const startY = event.clientY
  const origDate = new Date(task.calendarStart)
  const origStartMin = origDate.getHours() * 60 + origDate.getMinutes()
  const endMin = origStartMin + (task.calendarDuration || 60)
  const dayDate = new Date(origDate)
  dayDate.setHours(0, 0, 0, 0)

  function onMove(e) {
    const dy = e.clientY - startY
    const delta = (dy / hourHeight.value) * 60
    let newStartMin = Math.round((origStartMin + delta) / 5) * 5
    newStartMin = Math.max(0, Math.min(endMin - 5, newStartMin))
    const newDuration = endMin - newStartMin
    const others = tasksOnDay(dayDate, task.id)
    const hasCollision = others.some(o => newStartMin < o.endMin && endMin > o.startMin)
    if (!hasCollision) scheduleTask(task._projectId, task.id, buildCalendarDateTime(dayDate, newStartMin), newDuration)
  }
  function onUp() {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}


/* ═══════════════════════════════════════════════
   DEADLINE VIEW (kept as toggle)
═══════════════════════════════════════════════ */
const MONTHS = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December']
const DAYS_SHORT = ['Zo','Ma','Di','Wo','Do','Vr','Za']
const currentYear  = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())

function prevMonth() {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
  else currentMonth.value--
}
function nextMonth() {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
  else currentMonth.value++
}
function goThisMonth() {
  currentMonth.value = today.getMonth()
  currentYear.value  = today.getFullYear()
}

const isCurrentMonth = computed(() =>
  currentMonth.value === today.getMonth() && currentYear.value === today.getFullYear()
)

const calendarDays = computed(() => {
  const firstDay    = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const daysInPrev  = new Date(currentYear.value, currentMonth.value, 0).getDate()
  const days = []
  for (let i = firstDay - 1; i >= 0; i--)
    days.push({ date: new Date(currentYear.value, currentMonth.value - 1, daysInPrev - i), current: false })
  for (let d = 1; d <= daysInMonth; d++)
    days.push({ date: new Date(currentYear.value, currentMonth.value, d), current: true })
  while (days.length < 42)
    days.push({ date: new Date(currentYear.value, currentMonth.value + 1, days.length - firstDay - daysInMonth + 1), current: false })
  return days
})

function deadlineTasksForDay(date) {
  const ds = date.toDateString()
  const tasks = []
  for (const p of projects.value) {
    const all = [...p.backlog, ...p.groups.flatMap(g => g.tasks)]
    for (const t of all) {
      if (t.deadline && new Date(t.deadline).toDateString() === ds)
        tasks.push({ ...t, _projectColor: p.color })
    }
  }
  return tasks
}
</script>

<template>
  <AppLayout>
    <div class="cal-page">

      <!-- ── SIDEBAR ── -->
      <aside class="cal-sidebar">
        <div class="sidebar-head">
          <span class="sidebar-title">{{ t('projects') }}</span>
          <div class="sidebar-sort-row">
            <select v-model="projectSort" class="sidebar-sort-select" :aria-label="t('sortProjects')">
              <option value="name_asc">{{ t('projectsByName') }}</option>
              <option value="tasks_desc">{{ t('projectsByTasks') }}</option>
              <option value="recent_desc">{{ t('projectsByRecent') }}</option>
            </select>
            <select v-model="taskSort" class="sidebar-sort-select" :aria-label="t('sortTasks')">
              <option value="recent_desc">{{ t('tasksByRecent') }}</option>
              <option value="deadline_asc">{{ t('tasksByDeadline') }}</option>
              <option value="status">{{ t('tasksByStatus') }}</option>
              <option value="name_asc">{{ t('tasksByName') }}</option>
            </select>
          </div>
        </div>
        <div class="sidebar-body">
          <div
            v-for="p in sidebarProjects"
            :key="p.id"
            class="sb-project"
          >
            <button class="sb-project-header" @click="toggleProject(p.id)">
              <span class="sb-project-dot" :style="{ background: p.color }"></span>
              <span class="sb-project-name">{{ p.name }}</span>
              <svg
                class="sb-chevron"
                :class="{ 'sb-chevron--open': sidebarExpanded[p.id] }"
                width="12" height="12" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="2.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
            <div v-if="sidebarExpanded[p.id]" class="sb-task-list">
              <div
                v-if="p.allTasks.length === 0"
                class="sb-task-empty"
              >{{ t('noTasks') }}</div>
              <div
                v-for="task in p.allTasks"
                :key="task.id"
                class="sb-task-item"
                :class="{ 
                  'sb-task-item--scheduled': !!task.calendarStart,
                  'sb-task-item--overdue': isTaskOverdue(task)
                }"
                draggable="true"
                @dragstart="onTaskDragStart($event, task, p)"
              >
                <span class="sb-task-drag">
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01"/>
                  </svg>
                </span>
                <span class="sb-task-text">{{ task.text }}</span>
                <span v-if="task.calendarStart" class="sb-task-scheduled-dot" :style="{ background: p.color }"></span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- ── MAIN ── -->
      <div class="cal-main">

        <!-- Top bar -->
        <div class="cal-topbar">
          <div class="cal-topbar-left">
            <!-- View toggle -->
            <div class="view-toggle">
              <button
                class="view-btn"
                :class="{ 'view-btn--active': viewMode === 'schedule' }"
                @click="viewMode = 'schedule'"
              >{{ t('planning') }}</button>
              <button
                class="view-btn"
                :class="{ 'view-btn--active': viewMode === 'deadline' }"
                @click="viewMode = 'deadline'"
              >{{ t('deadlines') }}</button>
            </div>
          </div>

          <!-- Schedule nav -->
          <div v-if="viewMode === 'schedule'" class="cal-topbar-center">
            <button class="nav-btn" @click="prevWeek">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <span class="week-label">{{ weekLabel }}</span>
            <button class="nav-btn" @click="nextWeek">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
            <button v-if="!isCurrentWeek" class="today-btn" @click="goThisWeek">{{ t('goThisWeek') }}</button>
          </div>

          <!-- Deadline nav -->
          <div v-if="viewMode === 'deadline'" class="cal-topbar-center">
            <button class="nav-btn" @click="prevMonth">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <span class="week-label">{{ MONTHS[currentMonth] }} {{ currentYear }}</span>
            <button class="nav-btn" @click="nextMonth">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
            <button v-if="!isCurrentMonth" class="today-btn" @click="goThisMonth">{{ t('goThisMonth') }}</button>
          </div>

          <!-- Zoom (only schedule) -->
          <div class="cal-topbar-right">
            <template v-if="viewMode === 'schedule'">
              <button class="zoom-btn" @click="zoomOut" :title="t('zoomOut')">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" d="M20 12H4"/>
                </svg>
              </button>
              <button class="zoom-btn" @click="zoomIn" :title="t('zoomIn')">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" d="M12 4v16M4 12h16"/>
                </svg>
              </button>
            </template>
          </div>
        </div>

        <!-- ══ SCHEDULE VIEW ══ -->
        <div v-if="viewMode === 'schedule'" class="schedule-view">
          <!-- Day headers -->
          <div class="day-header-row">
            <div class="time-gutter-header"></div>
            <div
              v-for="(d, i) in weekDays"
              :key="i"
              class="day-header"
              :class="{ 'day-header--today': isToday(d) }"
            >
              <span class="day-header-name">{{ WEEK_DAYS[i] }}</span>
              <span class="day-header-date">{{ d.getDate() }}</span>
            </div>
          </div>

          <!-- Scrollable time grid -->
          <div class="time-grid-scroll" ref="timeGridScroll" @wheel="onWheelGrid">
            <div class="time-grid" :style="{ '--hour-h': hourHeight + 'px' }">
              <!-- Time gutter -->
              <div class="time-gutter">
                <div
                  v-for="h in HOURS"
                  :key="h"
                  class="time-label"
                  :style="{ height: hourHeight + 'px' }"
                >
                  {{ String(h).padStart(2,'0') }}:00
                </div>
              </div>

              <!-- Day columns -->
              <div
                v-for="(d, dayIndex) in weekDays"
                :key="dayIndex"
                class="day-col"
                :class="{ 'day-col--today': isToday(d) }"
                @dragover="onDragOver($event, dayIndex)"
                @dragleave="onDragLeave"
                @drop="onDrop($event, d)"
              >
                <!-- Hour grid lines -->
                <div
                  v-for="h in HOURS"
                  :key="h"
                  class="hour-line"
                  :style="{ height: hourHeight + 'px' }"
                ></div>

                <!-- Drop indicator -->
                <div
                  v-if="dragOverCell && dragOverCell.dayIndex === dayIndex"
                  class="drop-indicator"
                  :style="{
                    top: (dragOverCell.minute * hourHeight / 60) + 'px',
                    height: hourHeight + 'px'
                  }"
                ></div>

                <!-- Scheduled tasks -->
                <div
                  v-for="task in tasksForDay(dayIndex)"
                  :key="task.id"
                  class="task-block"
                  :class="{ 'task-block--overdue': isTaskOverdue(task) }"
                  draggable="true"
                  :style="{ ...taskStyle(task), '--tc': task.calendarColor || task._projectColor }"
                  @dragstart="onBlockDragStart($event, task)"
                  @dragend.stop="onBlockDragEnd"
                  @click="Date.now() - lastDragEndMs > 250 && openTaskDetail(task.id)"
                >
                  <!-- Top resize handle -->
                  <div
                    class="resize-handle resize-handle--top"
                    @mousedown.stop="startTopResize($event, task)"
                    @dragstart.stop.prevent
                    :title="t('dragChangeStart')"
                  ></div>
                  <div
                    class="task-block-inner"
                    :class="{
                      'task-block-inner--compact': blockHeight(task) < 34,
                      'task-block-inner--micro':   blockHeight(task) < 18,
                    }"
                  >
                    <span v-if="blockHeight(task) >= 34" class="task-block-time">{{ formatTime(task.calendarStart) }}–{{ taskEndTimeLabel(task) }}</span>
                    <span class="task-block-name">{{ task.text }}</span>
                  </div>
                  <!-- Color palette — direct child of task-block (not inside inner) so it is not clipped -->
                  <div class="task-tint-wrap" @click.stop>
                    <button class="task-tint-btn" @click.stop="activeTintTaskId = activeTintTaskId === task.id ? null : task.id" :title="t('changeColor')">
                      <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    </button>
                    <div v-if="activeTintTaskId === task.id" class="task-tint-palette">
                      <button
                        v-for="c in PRESET_COLORS"
                        :key="c"
                        class="tint-swatch"
                        :style="{ background: c }"
                        @click.stop="updateTask(task.id, { calendarColor: c }); activeTintTaskId = null"
                      ></button>
                      <button
                        class="tint-swatch tint-swatch--none"
                        @click.stop="updateTask(task.id, { calendarColor: null }); activeTintTaskId = null"
                        :title="t('clearColor')"
                      >✕</button>
                    </div>
                  </div>
                  <div
                    class="resize-handle"
                    @mousedown.stop="startResize($event, task)"
                    @dragstart.stop.prevent
                    :title="t('dragResize')"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ══ DEADLINE VIEW ══ -->
        <div v-if="viewMode === 'deadline'" class="deadline-view">
          <div class="dl-day-headers">
            <div v-for="d in DAYS_SHORT" :key="d" class="dl-day-header">{{ d }}</div>
          </div>
          <div class="dl-grid">
            <div
              v-for="(day, i) in calendarDays"
              :key="i"
              class="dl-cell"
              :class="{
                'dl-cell--other': !day.current,
                'dl-cell--today': day.date.toDateString() === today.toDateString()
              }"
            >
              <span class="dl-cell-date">{{ day.date.getDate() }}</span>
              <div class="dl-tasks">
                <div
                  v-for="task in deadlineTasksForDay(day.date)"
                  :key="task.id"
                  class="dl-task"
                  :style="{ '--tc': task.calendarColor || task._projectColor }"
                  @click="openTaskDetail(task.id)"
                >
                  {{ task.text }}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
/* ═══════════════════════════════════════════════
   PAGE LAYOUT
═══════════════════════════════════════════════ */
.cal-page {
  display: flex;
  height: 100%;
  overflow: hidden;
  background: var(--color-surface-0);
}

/* ═══════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════ */
.cal-sidebar {
  width: 240px;
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-surface-1);
}
.sidebar-head {
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--color-border-sub);
  flex-shrink: 0;
}
.sidebar-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-3);
}
.sidebar-sort-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  margin-top: 10px;
}
.sidebar-sort-select {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface-2);
  color: var(--color-text-1);
  font-size: 11px;
  font-family: inherit;
  padding: 5px 8px;
}
.sidebar-sort-select:focus {
  outline: none;
  border-color: var(--color-accent);
}
.sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}
.sb-project { }
.sb-project-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-1);
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  text-align: left;
  transition: background 0.12s;
}
.sb-project-header:hover { background: var(--color-surface-2); }
.sb-project-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.sb-project-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sb-chevron {
  color: var(--color-text-3);
  flex-shrink: 0;
  transition: transform 0.15s;
}
.sb-chevron--open { transform: rotate(90deg); }

.sb-task-list { padding: 2px 0 6px 32px; }
.sb-task-empty {
  font-size: 12px;
  color: var(--color-text-3);
  font-style: italic;
  padding: 4px 0;
}
.sb-task-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 0;
  cursor: grab;
  border-radius: 4px;
  transition: background 0.1s;
}
.sb-task-item:hover { background: var(--color-surface-2); }
.sb-task-item:active { cursor: grabbing; }
.sb-task-item--scheduled { opacity: 0.55; }
.sb-task-item--overdue {
  opacity: 0.6;
  cursor: not-allowed;
}
.sb-task-item--overdue:hover {
  background: transparent;
}
.sb-task-drag { color: var(--color-text-3); flex-shrink: 0; }
.sb-task-text {
  font-size: 12px;
  color: var(--color-text-2);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sb-task-scheduled-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ═══════════════════════════════════════════════
   MAIN AREA
═══════════════════════════════════════════════ */
.cal-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Top bar ── */
.cal-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 52px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  gap: 12px;
}
.cal-topbar-left,
.cal-topbar-center,
.cal-topbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
}
.cal-topbar-center { flex: 1; justify-content: center; }

.view-toggle {
  display: flex;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 7px;
  padding: 2px;
  gap: 2px;
}
.view-btn {
  padding: 4px 12px;
  border-radius: 5px;
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-2);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  font-family: inherit;
}
.view-btn--active {
  background: var(--color-surface-3);
  color: var(--color-text-1);
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-2);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.nav-btn:hover { background: var(--color-surface-2); color: var(--color-text-1); }

.week-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-1);
  min-width: 180px;
  text-align: center;
}

.today-btn {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-2);
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, color 0.15s;
}
.today-btn:hover { background: var(--color-surface-2); color: var(--color-text-1); }

.zoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-2);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.zoom-btn:hover { background: var(--color-surface-2); color: var(--color-text-1); }

/* ═══════════════════════════════════════════════
   SCHEDULE VIEW
═══════════════════════════════════════════════ */
.schedule-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.day-header-row {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  background: var(--color-surface-1);
}
.time-gutter-header {
  width: 56px;
  flex-shrink: 0;
}
.day-header {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  border-left: 1px solid var(--color-border-sub);
  gap: 2px;
}
.day-header--today .day-header-date {
  background: var(--color-accent);
  color: #fff;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.day-header-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-3);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.day-header-date {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-1);
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-grid-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
.time-grid {
  display: flex;
  position: relative;
  min-height: 100%;
}

/* Time gutter */
.time-gutter {
  width: 56px;
  flex-shrink: 0;
  border-right: 1px solid var(--color-border-sub);
}
.time-label {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 4px 8px 0 0;
  font-size: 10px;
  color: var(--color-text-3);
  font-variant-numeric: tabular-nums;
  border-bottom: 1px solid var(--color-border-sub);
  box-sizing: border-box;
  user-select: none;
}

/* Day columns */
.day-col {
  flex: 1;
  position: relative;
  border-left: 1px solid var(--color-border-sub);
}
.day-col--today { background: color-mix(in srgb, var(--color-accent) 4%, transparent); }

.hour-line {
  border-bottom: 1px solid var(--color-border-sub);
  box-sizing: border-box;
}

/* Drop indicator */
.drop-indicator {
  position: absolute;
  left: 2px;
  right: 2px;
  background: color-mix(in srgb, var(--color-accent) 20%, transparent);
  border: 1.5px dashed var(--color-accent);
  border-radius: 4px;
  pointer-events: none;
  z-index: 1;
}

/* Task blocks */
.task-block {
  position: absolute;
  left: 3px;
  right: 3px;
  background: color-mix(in srgb, var(--tc, var(--color-accent)) 20%, var(--color-surface-1));
  border: 1.5px solid var(--tc, var(--color-accent));
  border-radius: 5px;
  cursor: pointer;
  z-index: 2;
  display: flex;
  flex-direction: column;
  /* overflow must remain visible so the palette dropdown can escape */
  overflow: visible;
  transition: filter 0.12s;
}
.task-block:hover { filter: brightness(1.15); }
.task-block--overdue {
  opacity: 0.55;
  cursor: not-allowed;
}
.task-block--overdue:hover { filter: none; }
/* clip only the inner content, not the palette which escapes to the side */
.task-block > .resize-handle,
.task-block > .resize-handle--top {
  /* resize handles are safe to clip */
}
.task-block-inner {
  flex: 1;
  padding: 3px 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.task-block-time {
  font-size: 10px;
  font-weight: 600;
  color: var(--tc, var(--color-accent));
  opacity: 0.9;
}
.task-block-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.task-block-inner--compact {
  padding: 1px 4px;
}
.task-block-inner--compact .task-block-name {
  font-size: 10px;
  line-height: 1.2;
}
.task-block-inner--micro .task-block-name {
  display: none;
}

/* ── Task color swatch ── */
.task-tint-wrap {
  position: relative;
  padding: 0 4px 2px;
}
.task-tint-btn {
  display: flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; border-radius: 4px; border: none;
  background: color-mix(in srgb, currentColor 10%, transparent);
  color: var(--color-text-2); cursor: pointer; opacity: 0;
  transition: opacity 0.15s, background 0.12s;
}
.task-block:hover .task-tint-btn { opacity: 1; }
.task-tint-palette {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  display: flex; flex-wrap: wrap; gap: 4px;
  padding: 6px; border-radius: 8px;
  background: var(--color-surface-1);
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  z-index: 999; width: max-content; max-width: 140px;
}
.tint-swatch {
  width: 18px; height: 18px; border-radius: 4px;
  border: 1.5px solid transparent; cursor: pointer;
  transition: transform 0.1s, border-color 0.1s;
}
.tint-swatch:hover { transform: scale(1.2); border-color: #fff; }
.tint-swatch--none {
  background: var(--color-surface-3); color: var(--color-text-3);
  font-size: 10px; display: flex; align-items: center; justify-content: center;
  border-color: var(--color-border);
}

.resize-handle {
  height: 6px;
  background: var(--tc, var(--color-accent));
  opacity: 0.4;
  cursor: s-resize;
  flex-shrink: 0;
  border-radius: 0 0 3px 3px;
  transition: opacity 0.15s;
}
.resize-handle:hover { opacity: 0.75; }

.resize-handle--top {
  cursor: n-resize;
  border-radius: 3px 3px 0 0;
}

/* ═══════════════════════════════════════════════
   DEADLINE VIEW
═══════════════════════════════════════════════ */
.deadline-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.dl-day-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  background: var(--color-surface-1);
}
.dl-day-header {
  padding: 8px;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.dl-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr);
  flex: 1;
  overflow: hidden;
}
.dl-cell {
  border-right: 1px solid var(--color-border-sub);
  border-bottom: 1px solid var(--color-border-sub);
  padding: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dl-cell--other { background: color-mix(in srgb, var(--color-surface-1) 30%, transparent); }
.dl-cell--today { background: color-mix(in srgb, var(--color-accent) 6%, transparent); }
.dl-cell-date {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-2);
  margin-bottom: 2px;
}
.dl-cell--other .dl-cell-date { color: var(--color-text-3); }
.dl-cell--today .dl-cell-date {
  color: var(--color-accent);
}
.dl-tasks { display: flex; flex-direction: column; gap: 2px; overflow: hidden; }
.dl-task {
  font-size: 11px;
  padding: 2px 5px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--tc, var(--color-accent)) 20%, transparent);
  color: var(--color-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  border-left: 2px solid var(--tc, var(--color-accent));
  transition: filter 0.12s;
}
.dl-task:hover { filter: brightness(1.2); }
</style>
