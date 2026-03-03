<script setup>
import { ref, nextTick, computed } from 'vue'
import GroupCard from './GroupCard.vue'
import ColorPicker from './ColorPicker.vue'
import { groups, archivedGroups, createGroup, restoreGroup, deleteArchivedGroup, updateGroup, projectLabels } from '@/stores/boardStore'
import { formatLongDate, formatShortDate } from '@/utils/dates'
import { STATUS_OPTIONS, PRIORITY_OPTIONS, STATUS_META } from '@/utils/constants'
import { openTaskDetail } from '@/stores/uiStore'

const activeTab = ref('board') // 'board' | 'archive'
const detailGroupId = ref(null)
const showNameInput = ref(false)
const groupName = ref('')
const nameInput = ref(null)

async function openNameInput() {
  showNameInput.value = true
  groupName.value = ''
  await nextTick()
  nameInput.value?.focus()
}

function submitGroup() {
  const name = groupName.value.trim()
  createGroup(name || undefined)
  showNameInput.value = false
  groupName.value = ''
}

function cancelCreate() {
  showNameInput.value = false
  groupName.value = ''
}

function openGroupDetail(groupId) {
  detailGroupId.value = groupId
}

function closeDetail() {
  detailGroupId.value = null
}

const detailGroup = computed(() =>
  groups.value.find(g => g.id === detailGroupId.value) ?? null
)

const PRIORITY_COLORS = {
  low: '#46a758', medium: '#5b5bd6', high: '#f76b15', urgent: '#e5484d',
}
</script>

<template>
  <div class="board-wrap">
    <!-- Tab bar -->
    <div class="board-tabs">
      <div class="board-tabs-left">
        <button
          class="board-tab"
          :class="{ 'board-tab--active': activeTab === 'board' }"
          @click="activeTab = 'board'"
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          Board
        </button>
        <button
          class="board-tab"
          :class="{ 'board-tab--active': activeTab === 'archive' }"
          @click="activeTab = 'archive'; detailGroupId = null"
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          Archive
          <span v-if="archivedGroups.length" class="archive-badge">{{ archivedGroups.length }}</span>
        </button>
      </div>
      <div v-if="activeTab === 'board'" class="board-tabs-right">
        <Transition name="fade" mode="out-in">
          <div v-if="showNameInput" key="form" class="tabs-add-form">
            <input
              ref="nameInput"
              v-model="groupName"
              class="tabs-add-input"
              placeholder="Group name…"
              @keydown.enter="submitGroup"
              @keydown.escape="cancelCreate"
            />
            <button class="tabs-add-confirm" @click="submitGroup">Create</button>
            <button class="tabs-add-cancel" @click="cancelCreate">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <button v-else key="btn" class="tabs-add-btn" @click="openNameInput" title="Add group">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add group
          </button>
        </Transition>
      </div>
    </div>

    <!-- ══ BOARD VIEW ══ -->
    <div v-if="activeTab === 'board'" class="board">
      <TransitionGroup name="group" tag="div" class="board-inner">
        <GroupCard
          v-for="group in groups"
          :key="group.id"
          :group="group"
          @openDetail="openGroupDetail"
        />
      </TransitionGroup>

      <!-- Empty state -->
      <div v-if="groups.length === 0" class="board-empty">
        <p>No groups yet. Click <strong>Add group</strong> in the toolbar above to get started.</p>
      </div>
    </div>

    <!-- ══ ARCHIVE VIEW ══ -->
    <div v-else-if="activeTab === 'archive'" class="archive-view">
      <div v-if="archivedGroups.length === 0" class="archive-empty">
        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
        <p>No archived groups</p>
        <span>Archive a group using the ⤓ button on any group header.</span>
      </div>

      <TransitionGroup name="archive-list" tag="div" class="archive-list" v-else>
        <div v-for="group in archivedGroups" :key="group.id" class="archive-card">
          <div class="archive-card-bar" v-if="group.color" :style="{ background: group.color }"></div>
          <div class="archive-card-main">
            <div class="archive-card-info">
              <div class="archive-card-name-row">
                <span class="archive-card-name">{{ group.name }}</span>
                <span class="archive-card-count">{{ group.tasks.length }} task{{ group.tasks.length !== 1 ? 's' : '' }}</span>
              </div>
              <p v-if="group.description" class="archive-card-desc">{{ group.description }}</p>
              <span class="archive-card-date">Archived {{ formatLongDate(group.archivedAt) }}</span>
            </div>
            <!-- Task preview -->
            <div class="archive-task-preview" v-if="group.tasks.length">
              <span v-for="t in group.tasks.slice(0, 4)" :key="t.id" class="archive-task-pill">{{ t.text }}</span>
              <span v-if="group.tasks.length > 4" class="archive-task-more">+{{ group.tasks.length - 4 }} more</span>
            </div>
            <div class="archive-card-actions">
              <button class="arch-btn arch-btn--restore" @click="restoreGroup(group.id)">
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
                Restore
              </button>
              <button class="arch-btn arch-btn--delete" @click="deleteArchivedGroup(group.id)">
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- ══ GROUP DETAIL OVERLAY ══ -->
    <Teleport to="body">
      <Transition name="group-detail">
        <div v-if="detailGroupId && detailGroup" class="group-detail-overlay" @click.self="closeDetail">
          <div class="group-detail-panel">
            <!-- Panel header -->
            <div class="group-detail-hdr">
              <span class="group-detail-hdr-label">Group detail</span>
              <button class="group-detail-close" @click="closeDetail" aria-label="Close">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Scrollable body -->
            <div class="group-detail-body">
              <div class="detail-panel">
                <!-- Header card -->
                <div class="detail-header" :style="detailGroup.color ? { borderLeftColor: detailGroup.color } : {}">
                  <div class="detail-header-top">
                    <div class="detail-title-row">
                      <span
                        class="detail-priority-dot"
                        v-if="detailGroup.priority"
                        :style="{ background: PRIORITY_COLORS[detailGroup.priority] }"
                        :title="detailGroup.priority"
                      ></span>
                      <h2 class="detail-group-name">{{ detailGroup.name }}</h2>
                    </div>
                    <div class="detail-chips">
                      <span
                        v-if="detailGroup.status && detailGroup.status !== 'not_started'"
                        class="detail-status-chip"
                      >
                        {{ STATUS_OPTIONS.find(s => s.value === detailGroup.status)?.label ?? detailGroup.status }}
                      </span>
                      <span v-for="lid in (detailGroup.labelIds || [])" :key="lid" class="detail-label-chip"
                        :style="{ background: (projectLabels.find(l => l.id === lid)?.color || '#888') + '22', color: projectLabels.find(l => l.id === lid)?.color || '#888', borderColor: (projectLabels.find(l => l.id === lid)?.color || '#888') + '44' }"
                      >
                        {{ projectLabels.find(l => l.id === lid)?.name }}
                      </span>
                    </div>
                  </div>
                  <p v-if="detailGroup.description" class="detail-description">{{ detailGroup.description }}</p>
                  <div class="detail-meta-row">
                    <span class="detail-meta-item" v-if="detailGroup.deadline">
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                      {{ formatShortDate(detailGroup.deadline) }}
                    </span>
                    <span class="detail-meta-item">
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                      {{ detailGroup.tasks.length }} task{{ detailGroup.tasks.length !== 1 ? 's' : '' }}
                    </span>
                  </div>
                </div>

                <!-- Tasks -->
                <div class="detail-tasks-section">
                  <div class="detail-section-title">Tasks</div>
                  <div v-if="detailGroup.tasks.length === 0" class="detail-empty">
                    No tasks in this group yet.
                  </div>
                  <div class="detail-task-list" v-else>
                    <div
                      v-for="task in detailGroup.tasks"
                      :key="task.id"
                      class="detail-task-row"
                      :style="task.color ? { borderLeftColor: task.color } : {}"
                      @click="openTaskDetail(task.id); closeDetail()"
                    >
                      <span class="detail-task-check" :class="{ 'detail-task-check--done': task.done }">
                        <svg v-if="task.done" width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                      </span>
                      <span class="detail-task-text" :class="{ 'detail-task-text--done': task.done }">{{ task.text }}</span>
                      <span v-if="task.priority" class="detail-task-priority-dot" :style="{ background: PRIORITY_COLORS[task.priority] }"></span>
                      <span v-if="task.deadline" class="detail-task-date">{{ formatShortDate(task.deadline) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.board-wrap {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: hidden;
}

/* Tab bar */
.board-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 20px 0;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  background: var(--color-surface-1);
}
.board-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 6px 6px 0 0;
  border: none;
  background: transparent;
  color: var(--color-text-3);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s, background 0.15s, box-shadow 0.15s;
  position: relative;
}
.board-tab:hover { color: var(--color-text-1); background: var(--color-surface-2); }
.board-tab--active {
  color: var(--color-text-1);
  background: var(--color-surface-2);
  box-shadow: inset 0 -2px 0 var(--color-accent);
}
.archive-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 99px;
  background: color-mix(in srgb, #f5c842 20%, transparent);
  color: #f5c842;
  border: 1px solid color-mix(in srgb, #f5c842 30%, transparent);
}

/* ══ BOARD VIEW ══ */
.board {
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}
.board-inner {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: flex-start;
  height: 100%;
  padding: 16px;
  gap: 12px;
  box-sizing: border-box;
}
.board-empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--color-text-3);
  font-size: 14px;
}
.form-actions { display: flex; gap: 6px; margin-top: 10px; }
.btn-primary {
  flex: 1; height: 32px; border-radius: 6px; border: none;
  background: var(--color-accent); color: #fff;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s;
}
.btn-primary:hover { background: var(--color-accent-hover); }
.btn-ghost {
  height: 32px; padding: 0 12px; border-radius: 6px;
  border: 1px solid var(--color-border); background: transparent;
  color: var(--color-text-2); font-size: 13px; cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.btn-ghost:hover { background: var(--color-surface-3); color: var(--color-text-1); }
.add-col-btn {
  display: flex; align-items: center; gap: 8px; width: 100%;
  padding: 10px 14px; border-radius: 8px; border: 1px dashed var(--color-border);
  background: transparent; color: var(--color-text-3);
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.add-col-btn:hover {
  border-color: var(--color-accent);
  background: var(--color-surface-2);
  color: var(--color-text-1);
}

/* ══ ARCHIVE VIEW ══ */
.archive-view {
  flex: 1;
  overflow-y: auto;
  padding: 28px 32px;
}
.archive-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding-top: 64px;
  text-align: center;
  color: var(--color-text-3);
}
.archive-empty p { font-size: 15px; font-weight: 600; color: var(--color-text-2); }
.archive-empty span { font-size: 13px; }

.archive-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 760px;
  margin: 0 auto;
}
.archive-card {
  display: flex;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.15s;
}
.archive-card:hover { border-color: var(--color-text-3); }
.archive-card-bar { width: 4px; flex-shrink: 0; }
.archive-card-main { flex: 1; min-width: 0; padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; }
.archive-card-info { display: flex; flex-direction: column; gap: 4px; }
.archive-card-name-row { display: flex; align-items: center; gap: 10px; }
.archive-card-name { font-size: 14px; font-weight: 700; color: var(--color-text-1); }
.archive-card-count {
  font-size: 11px; font-weight: 600; padding: 1px 7px;
  border-radius: 99px; background: var(--color-surface-3);
  color: var(--color-text-2); border: 1px solid var(--color-border);
}
.archive-card-desc { font-size: 12px; color: var(--color-text-3); line-height: 1.5; }
.archive-card-date { font-size: 11px; color: var(--color-text-3); }

/* Task preview pills */
.archive-task-preview { display: flex; flex-wrap: wrap; gap: 5px; }
.archive-task-pill {
  font-size: 11px; padding: 2px 9px; border-radius: 99px;
  background: var(--color-surface-3); color: var(--color-text-2);
  border: 1px solid var(--color-border);
  white-space: nowrap; overflow: hidden; max-width: 200px; text-overflow: ellipsis;
}
.archive-task-more { font-size: 11px; color: var(--color-text-3); align-self: center; }

.archive-card-actions { display: flex; gap: 8px; }
.arch-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 13px; border-radius: 6px;
  font-size: 12px; font-weight: 500; cursor: pointer;
  transition: background 0.1s, color 0.1s, border-color 0.1s;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-2);
}
.arch-btn--restore:hover { background: color-mix(in srgb, var(--color-accent) 12%, transparent); color: var(--color-accent); border-color: var(--color-accent); }
.arch-btn--delete:hover { background: var(--color-danger-bg); color: var(--color-danger); border-color: var(--color-danger); }

/* Transitions */
.archive-list-move { transition: transform 0.2s; }
.archive-list-enter-active, .archive-list-leave-active { transition: all 0.2s ease; }
.archive-list-enter-from { opacity: 0; transform: translateX(-10px); }
.archive-list-leave-to   { opacity: 0; transform: translateX(10px); }

/* ══ TAB BAR LAYOUT ══ */
.board-tabs { justify-content: space-between; }
.board-tabs-left { display: flex; align-items: center; gap: 4px; }
.board-tabs-right { display: flex; align-items: center; gap: 6px; padding-bottom: 1px; }
.tabs-add-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 11px; border-radius: 6px;
  border: 1px solid var(--color-border);
  background: transparent; color: var(--color-text-2);
  font-size: 12px; font-weight: 500; cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.tabs-add-btn:hover { background: var(--color-surface-2); color: var(--color-accent); border-color: var(--color-accent); }

/* Inline add-group form in tab bar */
.tabs-add-form {
  display: flex;
  align-items: center;
  gap: 5px;
}
.tabs-add-input {
  height: 28px;
  padding: 0 9px;
  border-radius: 6px;
  border: 1px solid var(--color-accent);
  background: var(--color-surface-0);
  color: var(--color-text-1);
  font-size: 13px;
  outline: none;
  width: 160px;
}
.tabs-add-confirm {
  height: 28px;
  padding: 0 11px;
  border-radius: 6px;
  border: none;
  background: var(--color-accent);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.tabs-add-confirm:hover { background: var(--color-accent-hover); }
.tabs-add-cancel {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-3);
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}
.tabs-add-cancel:hover { background: var(--color-surface-3); color: var(--color-text-1); }
.board-tab--detail { gap: 6px; padding-right: 6px; }
.detail-tab-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.detail-tab-close {
  display: flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; border-radius: 3px; border: none;
  background: transparent; color: var(--color-text-3); cursor: pointer;
  transition: background 0.12s, color 0.12s; margin-left: 2px;
}
.detail-tab-close:hover { background: var(--color-surface-3); color: var(--color-text-1); }

/* ══ GROUP DETAIL OVERLAY ══ */
.group-detail-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: flex-end;
}
.group-detail-panel {
  width: 100%;
  max-width: 520px;
  height: 100%;
  background: var(--color-surface-1);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.group-detail-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border-sub);
  flex-shrink: 0;
}
.group-detail-hdr-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-3);
}
.group-detail-close {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border: none; border-radius: 6px;
  background: transparent; color: var(--color-text-3); cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.group-detail-close:hover { background: var(--color-surface-3); color: var(--color-text-1); }
.group-detail-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Transition */
.group-detail-enter-active { transition: opacity 0.22s ease; }
.group-detail-leave-active { transition: opacity 0.18s ease; }
.group-detail-enter-active .group-detail-panel,
.group-detail-leave-active .group-detail-panel { transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1); }
.group-detail-enter-from, .group-detail-leave-to { opacity: 0; }
.group-detail-enter-from .group-detail-panel,
.group-detail-leave-to .group-detail-panel { transform: translateX(28px); }
.detail-panel {
  width: 100%; max-width: 680px;
  display: flex; flex-direction: column; gap: 24px;
}
.detail-header {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-border);
  border-radius: 10px;
  padding: 20px 22px;
  display: flex; flex-direction: column; gap: 10px;
  transition: border-left-color 0.2s;
}
.detail-header-top { display: flex; flex-direction: column; gap: 8px; }
.detail-title-row { display: flex; align-items: center; gap: 10px; }
.detail-priority-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.detail-group-name { font-size: 18px; font-weight: 700; color: var(--color-text-1); margin: 0; }
.detail-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.detail-status-chip {
  font-size: 11px; font-weight: 600; padding: 2px 9px;
  border-radius: 99px; background: var(--color-surface-3);
  color: var(--color-text-2); border: 1px solid var(--color-border);
}
.detail-label-chip {
  font-size: 11px; font-weight: 600; padding: 2px 9px;
  border-radius: 99px; border: 1px solid;
}
.detail-description { font-size: 13px; color: var(--color-text-2); line-height: 1.6; margin: 0; }
.detail-meta-row { display: flex; gap: 16px; }
.detail-meta-item {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: var(--color-text-3);
}
.detail-tasks-section { display: flex; flex-direction: column; gap: 10px; }
.detail-section-title {
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.06em; color: var(--color-text-3);
}
.detail-empty { font-size: 13px; color: var(--color-text-3); padding: 12px 0; }
.detail-task-list { display: flex; flex-direction: column; gap: 4px; }
.detail-task-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border-radius: 8px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-border);
  cursor: pointer; transition: border-color 0.12s, background 0.12s;
}
.detail-task-row:hover { background: var(--color-surface-3); border-color: var(--color-text-3); }
.detail-task-check {
  width: 16px; height: 16px; border-radius: 4px; flex-shrink: 0;
  border: 1.5px solid var(--color-border);
  display: flex; align-items: center; justify-content: center;
  color: var(--color-accent);
}
.detail-task-check--done { background: var(--color-accent); border-color: var(--color-accent); color: #fff; }
.detail-task-text { flex: 1; font-size: 13px; color: var(--color-text-1); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.detail-task-text--done { text-decoration: line-through; color: var(--color-text-3); }
.detail-task-priority-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.detail-task-date { font-size: 11px; color: var(--color-text-3); flex-shrink: 0; }
</style>
