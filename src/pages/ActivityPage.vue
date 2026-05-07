<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { projects, setActiveProject } from '@/stores/projectStore'
import { user } from '@/stores/authStore'
import { openTaskDetail } from '@/stores/uiStore'
import { STATUS_META } from '@/utils/constants'

const router = useRouter()

// Gather all tasks across all projects
const allTasks = computed(() => {
  const tasks = []
  for (const p of projects.value) {
    for (const t of [...p.backlog, ...p.groups.flatMap(g => g.tasks)]) {
      tasks.push({ ...t, projectId: p.id, projectName: p.name, projectColor: p.color })
    }
  }
  return tasks
})

// Sort by creation date (most recent first)
const allTasksSorted = computed(() =>
  [...allTasks.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
)

// Filter options
const activeFilter = ref('all') // 'all' | 'started' | 'overdue' | 'done'
const searchQuery = ref('')

// Filtered tasks based on status and search
const filteredTasks = computed(() => {
  let result = allTasksSorted.value

  // Filter by status
  if (activeFilter.value === 'started') {
    result = result.filter(t => t.status === 'started')
  } else if (activeFilter.value === 'overdue') {
    const now = new Date()
    result = result.filter(t => t.deadline && t.status !== 'done' && new Date(t.deadline) < now)
  } else if (activeFilter.value === 'done') {
    result = result.filter(t => t.status === 'done')
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(t =>
      t.text.toLowerCase().includes(query) ||
      t.projectName.toLowerCase().includes(query)
    )
  }

  return result
})

// Stats for quick access
const stats = computed(() => {
  const all = allTasks.value
  return {
    total: all.length,
    started: all.filter(t => t.status === 'started').length,
    overdue: all.filter(t => {
      const now = new Date()
      return t.deadline && t.status !== 'done' && new Date(t.deadline) < now
    }).length,
    done: all.filter(t => t.status === 'done').length,
  }
})

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function goToTask(task) {
  setActiveProject(task.projectId)
  openTaskDetail(task.id)
  router.push({ name: 'board', params: { id: task.projectId } })
}
</script>

<template>
  <AppLayout>
    <div class="activity-page">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">All Tasks</h1>
        <p class="page-sub">Complete overview of all your tasks</p>
      </div>

      <!-- Search bar -->
      <div class="search-wrapper">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search tasks..."
          class="search-input"
        />
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" class="search-icon">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </div>

      <!-- Filter buttons -->
      <div class="filter-buttons">
        <button
          class="filter-btn"
          :class="{ 'filter-btn--active': activeFilter === 'all' }"
          @click="activeFilter = 'all'"
        >
          All tasks ({{ stats.total }})
        </button>
        <button
          class="filter-btn filter-btn--accent"
          :class="{ 'filter-btn--active': activeFilter === 'started' }"
          @click="activeFilter = 'started'"
        >
          In progress ({{ stats.started }})
        </button>
        <button
          class="filter-btn filter-btn--warn"
          :class="{ 'filter-btn--active': activeFilter === 'overdue' }"
          @click="activeFilter = 'overdue'"
        >
          Overdue ({{ stats.overdue }})
        </button>
        <button
          class="filter-btn filter-btn--done"
          :class="{ 'filter-btn--active': activeFilter === 'done' }"
          @click="activeFilter = 'done'"
        >
          Completed ({{ stats.done }})
        </button>
      </div>

      <!-- Tasks list -->
      <div class="task-list-container">
        <div v-if="filteredTasks.length === 0" class="empty-state">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="empty-title">No tasks found</p>
          <p class="empty-desc">{{ searchQuery ? 'Try adjusting your search query' : 'All tasks completed or no tasks exist yet' }}</p>
        </div>

        <div v-else class="tasks-table">
          <div class="table-header">
            <div class="col-task">Task</div>
            <div class="col-project">Project</div>
            <div class="col-status">Status</div>
            <div class="col-deadline">Deadline</div>
          </div>
          <div
            v-for="task in filteredTasks"
            :key="task.id + '-' + task.projectId"
            class="table-row"
            @click="goToTask(task)"
          >
            <div class="col-task">
              <span class="task-title">{{ task.text }}</span>
            </div>
            <div class="col-project">
              <div class="project-badge" :style="{ background: task.projectColor }">
                <span class="project-name">{{ task.projectName }}</span>
              </div>
            </div>
            <div class="col-status">
              <span
                class="status-badge"
                :style="{ '--sb': STATUS_META[task.status]?.color }"
              >{{ STATUS_META[task.status]?.label }}</span>
            </div>
            <div class="col-deadline">
              <span v-if="task.deadline" class="deadline-text" :class="{ 'deadline-overdue': task.status !== 'done' && new Date(task.deadline) < new Date() }">
                {{ formatDate(task.deadline) }}
              </span>
              <span v-else class="deadline-text deadline-none">—</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.activity-page {
  flex: 1;
  overflow-y: auto;
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 26px;
  font-weight: 800;
  color: var(--color-text-1);
  letter-spacing: -0.02em;
}

.page-sub {
  font-size: 14px;
  color: var(--color-text-2);
}

/* Search bar */
.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 10px 14px 10px 36px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface-1);
  color: var(--color-text-1);
  font-size: 13px;
  font-family: inherit;
  transition: background 0.1s, border-color 0.1s;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-accent);
  background: var(--color-surface-2);
}

.search-input::placeholder {
  color: var(--color-text-3);
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--color-text-3);
  pointer-events: none;
}

/* Filter buttons */
.filter-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-1);
  color: var(--color-text-2);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.1s, color 0.1s, border-color 0.1s;
  font-family: inherit;
}

.filter-btn:hover {
  background: var(--color-surface-2);
  color: var(--color-text-1);
}

.filter-btn--active {
  background: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);
}

.filter-btn--accent.filter-btn--active {
  background: #5b5bd6;
  border-color: #5b5bd6;
}

.filter-btn--warn.filter-btn--active {
  background: #e5484d;
  border-color: #e5484d;
}

.filter-btn--done.filter-btn--active {
  background: #46a758;
  border-color: #46a758;
}

/* Task list container */
.task-list-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--color-text-3);
  text-align: center;
}

.empty-state svg {
  opacity: 0.5;
}

.empty-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-2);
}

.empty-desc {
  font-size: 12px;
  color: var(--color-text-3);
  max-width: 300px;
}

/* Tasks table */
.tasks-table {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--color-surface-1);
  flex: 1;
  min-height: 0;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1fr 1.2fr;
  gap: 12px;
  padding: 12px 16px;
  background: var(--color-surface-2);
  border-bottom: 1px solid var(--color-border-sub);
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-3);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1fr 1.2fr;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-sub);
  align-items: center;
  cursor: pointer;
  transition: background 0.1s;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: var(--color-surface-2);
}

.col-task,
.col-project,
.col-status,
.col-deadline {
  min-width: 0;
}

.task-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-1);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--color-accent);
  color: #fff;
}

.project-name {
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--sb, #52525f);
  background: color-mix(in srgb, var(--sb, #52525f) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--sb, #52525f) 30%, transparent);
  white-space: nowrap;
}

.deadline-text {
  font-size: 12px;
  color: var(--color-text-2);
}

.deadline-none {
  color: var(--color-text-3);
  opacity: 0.7;
}

.deadline-overdue {
  color: #e5484d;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 1024px) {
  .table-header,
  .table-row {
    grid-template-columns: 2fr 1fr 1fr;
  }

  .col-deadline {
    display: none;
  }
}

@media (max-width: 640px) {
  .activity-page {
    padding: 20px 16px;
  }

  .page-title {
    font-size: 20px;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr 1fr;
  }

  .col-project,
  .col-deadline {
    display: none;
  }
}
</style>
