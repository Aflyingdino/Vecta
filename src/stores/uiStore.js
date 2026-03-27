import { reactive } from 'vue'

export const ui = reactive({
  taskModalOpen: false,
  editTaskId: null,    // null = create mode, number = edit mode
  detailTaskId: null,  // open task detail panel for this id
  settingsOpen: false,
  lightMode: false,
})

let themeTransitionTimer = null

export function openCreateTask() {
  ui.editTaskId = null
  ui.taskModalOpen = true
}

export function openEditTask(taskId) {
  ui.editTaskId = taskId
  ui.taskModalOpen = true
}

export function closeTaskModal() {
  ui.taskModalOpen = false
  ui.editTaskId = null
}

export function openTaskDetail(taskId) {
  ui.detailTaskId = taskId
}

export function closeTaskDetail() {
  ui.detailTaskId = null
}

export function openSettings() {
  ui.settingsOpen = true
}

export function closeSettings() {
  ui.settingsOpen = false
}

export function toggleTheme() {
  ui.lightMode = !ui.lightMode
  applyTheme()
}

export function applyTheme() {
  const root = document.documentElement

  root.classList.add('theme-transition')
  if (themeTransitionTimer) clearTimeout(themeTransitionTimer)
  themeTransitionTimer = setTimeout(() => {
    root.classList.remove('theme-transition')
  }, 320)

  if (ui.lightMode) {
    root.classList.add('light-mode')
    // Force light theme by setting CSS variables directly on root
    root.style.setProperty('--color-text-1', '#0f172a', 'important')
    root.style.setProperty('--color-text-2', '#475569', 'important')
    root.style.setProperty('--color-text-3', '#94a3b8', 'important')
    root.style.setProperty('--color-surface-0', '#ffffff', 'important')
    root.style.setProperty('--color-surface-1', '#f9fafb', 'important')
    root.style.setProperty('--color-surface-2', '#f1f5f9', 'important')
    root.style.setProperty('--color-surface-3', '#e2e8f0', 'important')
    root.style.setProperty('--color-border', '#cbd5e1', 'important')
    root.style.setProperty('--color-border-sub', '#e2e8f0', 'important')
    root.style.setProperty('--color-accent', '#3b82f6', 'important')
    root.style.setProperty('--color-accent-hover', '#2563eb', 'important')
    root.style.setProperty('--color-accent-muted', '#dbeafe', 'important')
    root.style.setProperty('--color-danger', '#ef4444', 'important')
    root.style.setProperty('--color-danger-bg', '#fee2e2', 'important')
  } else {
    root.classList.remove('light-mode')
    // Reset to default (remove inline styles)
    root.style.removeProperty('--color-text-1')
    root.style.removeProperty('--color-text-2')
    root.style.removeProperty('--color-text-3')
    root.style.removeProperty('--color-surface-0')
    root.style.removeProperty('--color-surface-1')
    root.style.removeProperty('--color-surface-2')
    root.style.removeProperty('--color-surface-3')
    root.style.removeProperty('--color-border')
    root.style.removeProperty('--color-border-sub')
    root.style.removeProperty('--color-accent')
    root.style.removeProperty('--color-accent-hover')
    root.style.removeProperty('--color-accent-muted')
    root.style.removeProperty('--color-danger')
    root.style.removeProperty('--color-danger-bg')
  }
}
