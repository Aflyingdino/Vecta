<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import AppHeader from '@/components/AppHeader.vue'
import { projects, setActiveProject, activeProject } from '@/stores/projectStore'
import { user } from '@/stores/authStore'
import { openTaskDetail } from '@/stores/uiStore'
import { STATUS_META } from '@/utils/constants'

const route = useRoute()
const router = useRouter()

watchEffect(() => {
  const id = Number(route.params.id)
  const exists = projects.value.find(p => p.id === id)
  if (!exists) { router.push({ name: 'projects' }); return }
  setActiveProject(id)
})

// All tasks in the active project
const projectTasks = computed(() => {
  if (!activeProject.value) return []
  return [...activeProject.value.backlog, ...activeProject.value.groups.flatMap(g => g.tasks)]
})

// Stats
const stats = computed(() => {
  const all = projectTasks.value
  return {
    total: all.length,
    notStarted: all.filter(t => t.status === 'not_started').length,
    started: all.filter(t => t.status === 'started').length,
    readyForTest: all.filter(t => t.status === 'ready_for_test').length,
    done: all.filter(t => t.status === 'done').length,
  }
})

const overdueTasks = computed(() => {
  const now = new Date()
  return projectTasks.value.filter(t => t.deadline && t.status !== 'done' && new Date(t.deadline) < now)
})

const recentTasks = computed(() =>
  [...projectTasks.value]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
)

// Stat filter
const statFilter = ref(null)

const filteredStatTasks = computed(() => {
  if (!statFilter.value) return []
  if (statFilter.value === 'total') return projectTasks.value
  if (statFilter.value === 'started') return projectTasks.value.filter(t => t.status === 'started')
  if (statFilter.value === 'overdue') return overdueTasks.value
  if (statFilter.value === 'done') return projectTasks.value.filter(t => t.status === 'done')
  return []
})

const statFilterLabel = computed(() => ({
  total: 'All tasks', started: 'In progress', overdue: 'Overdue', done: 'Completed'
})[statFilter.value])

function toggleStatFilter(key) {
  statFilter.value = statFilter.value === key ? null : key
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function openTask(taskId) {
  openTaskDetail(taskId)
}
</script>

<template>
  <AppLayout>
    <div class="project-dashboard-page" v-if="activeProject">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon" :style="{ background: activeProject.color }">
            {{ activeProject.name[0] }}
          </div>
          <div class="header-text">
            <h1 class="page-title">{{ activeProject.name }}</h1>
            <p class="page-sub">{{ activeProject.description || 'Project overview' }}</p>
          </div>
        </div>
      </div>

      <!-- Stats row -->
      <div class="stats-grid">
        <button class="stat-card" :class="{ 'stat-card--active': statFilter === 'total' }" @click="toggleStatFilter('total')">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Total tasks</div>
        </button>
        <button class="stat-card stat-card--accent" :class="{ 'stat-card--active': statFilter === 'started' }" @click="toggleStatFilter('started')">
          <div class="stat-value">{{ stats.started }}</div>
          <div class="stat-label">In progress</div>
        </button>
        <button class="stat-card stat-card--warn" :class="{ 'stat-card--active': statFilter === 'overdue' }" @click="toggleStatFilter('overdue')">
          <div class="stat-value">{{ overdueTasks.length }}</div>
          <div class="stat-label">Overdue</div>
        </button>
        <button class="stat-card stat-card--done" :class="{ 'stat-card--active': statFilter === 'done' }" @click="toggleStatFilter('done')">
          <div class="stat-value">{{ stats.done }}</div>
          <div class="stat-label">Completed</div>
        </button>
      </div>

      <!-- Stat drill-down panel -->
      <Transition name="stat-panel">
        <div v-if="statFilter" class="stat-panel">
          <div class="stat-panel-header">
            <span class="stat-panel-title">{{ statFilterLabel }} <span class="stat-panel-count">{{ filteredStatTasks.length }}</span></span>
            <button class="stat-panel-close" @click="statFilter = null" aria-label="Close">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div v-if="filteredStatTasks.length === 0" class="stat-panel-empty">No tasks in this category.</div>
          <div class="stat-panel-list" v-else>
            <div
              v-for="t in filteredStatTasks"
              :key="t.id"
              class="stat-task-row"
              @click="openTask(t.id)"
            >
              <span class="stat-task-dot" :style="{ background: activeProject.color }"></span>
              <span class="stat-task-text">{{ t.text }}</span>
              <span v-if="t.deadline" class="stat-task-date">{{ formatDate(t.deadline) }}</span>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Content -->
      <div class="dashboard-grid">
        <!-- Overdue tasks -->
        <section class="dash-section" v-if="overdueTasks.length">
          <h2 class="section-title">
            <span class="dot dot--red"></span>
            Overdue ({{ overdueTasks.length }})
          </h2>
          <div class="task-list">
            <div
              v-for="t in overdueTasks"
              :key="t.id"
              class="task-row task-row--overdue"
              @click="openTask(t.id)"
            >
              <div class="task-row__info">
                <span class="task-row__text">{{ t.text }}</span>
              </div>
              <span class="task-row__date overdue">{{ formatDate(t.deadline) }}</span>
            </div>
          </div>
        </section>

        <!-- Recent tasks -->
        <section class="dash-section">
          <h2 class="section-title">
            <span class="dot dot--blue"></span>
            Recent tasks
          </h2>
          <div class="task-list" v-if="recentTasks.length">
            <div
              v-for="t in recentTasks"
              :key="t.id"
              class="task-row"
              @click="openTask(t.id)"
            >
              <div class="task-row__info">
                <span class="task-row__text">{{ t.text }}</span>
              </div>
              <span
                class="status-chip"
                :style="{ '--sc': STATUS_META[t.status]?.color }"
              >{{ STATUS_META[t.status]?.label }}</span>
            </div>
          </div>
          <div v-else class="empty-section">
            <p>No tasks yet in this project.</p>
          </div>
        </section>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.project-dashboard-page {
  flex: 1;
  overflow-y: auto;
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}

.header-text {
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

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
}

.stat-card {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s, border-color 0.12s, box-shadow 0.12s;
}

.stat-card:hover { background: var(--color-surface-3); }
.stat-card--active { box-shadow: 0 0 0 2px var(--color-accent); }
.stat-card--accent.stat-card--active { box-shadow: 0 0 0 2px #5b5bd6; }
.stat-card--warn.stat-card--active { box-shadow: 0 0 0 2px #e5484d; }
.stat-card--done.stat-card--active { box-shadow: 0 0 0 2px #46a758; }
.stat-card--accent { border-color: color-mix(in srgb, #5b5bd6 40%, transparent); }
.stat-card--warn { border-color: color-mix(in srgb, #e5484d 40%, transparent); }
.stat-card--done { border-color: color-mix(in srgb, #46a758 40%, transparent); }

.stat-value { font-size: 32px; font-weight: 800; color: var(--color-text-1); line-height: 1; }
.stat-label { font-size: 12px; color: var(--color-text-3); font-weight: 500; }

/* Stat drill-down panel */
.stat-panel {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
}

.stat-panel-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px;
  padding: 16px 18px 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-1);
  border-bottom: 1px solid var(--color-border-sub);
}

.stat-panel-title { flex: 1; }
.stat-panel-count { font-weight: 600; color: var(--color-accent); margin-left: 4px; }

.stat-panel-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s, color 0.1s;
}

.stat-panel-close:hover { background: var(--color-surface-3); color: var(--color-text-1); }

.stat-panel-empty { padding: 16px 18px; color: var(--color-text-3); font-size: 12px; text-align: center; }

.stat-panel-list { display: flex; flex-direction: column; }

.stat-task-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 18px 11px 18px;
  border-bottom: 1px solid var(--color-border-sub);
  cursor: pointer;
  transition: background 0.1s;
}

.stat-task-row:last-child { border-bottom: none; }
.stat-task-row:hover { background: var(--color-surface-3); }

.stat-task-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.stat-task-text {
  font-size: 13px;
  color: var(--color-text-1);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-task-date { font-size: 11px; color: var(--color-text-3); white-space: nowrap; }

/* Dashboard grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  align-items: start;
}

.dash-section {
  background: var(--color-surface-1);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 18px 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-1);
  border-bottom: 1px solid var(--color-border-sub);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot--red    { background: #e5484d; }
.dot--blue   { background: #5b5bd6; }
.dot--green  { background: #46a758; }
.dot--orange { background: #f76b15; }

/* Task rows */
.task-list { display: flex; flex-direction: column; }

.task-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 18px;
  border-bottom: 1px solid var(--color-border-sub);
  cursor: pointer;
  transition: background 0.1s;
}

.task-row:last-child { border-bottom: none; }
.task-row:hover { background: var(--color-surface-2); }
.task-row--overdue { border-left: 3px solid #e5484d; }

.task-row__info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }

.task-row__text {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-row__date { font-size: 11px; color: var(--color-text-3); white-space: nowrap; }
.task-row__date.overdue { color: #e5484d; font-weight: 600; }

.status-chip {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 99px;
  white-space: nowrap;
  color: var(--sc, #52525f);
  background: color-mix(in srgb, var(--sc, #52525f) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--sc, #52525f) 30%, transparent);
}

.empty-section {
  padding: 40px 20px;
  text-align: center;
  color: var(--color-text-3);
  font-size: 13px;
}

.empty-section p { margin: 0; }

/* Transitions */
.stat-panel-enter-active,
.stat-panel-leave-active {
  transition: all 0.2s ease;
}

.stat-panel-enter-from,
.stat-panel-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
