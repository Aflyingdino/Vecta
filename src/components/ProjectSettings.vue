<script setup>
import { ref, computed } from 'vue'
import { ui, closeSettings, toggleTheme } from '@/stores/uiStore'
import { toggleMuteProject, mutedProjectIds } from '@/stores/notificationStore'
import { projectLabels, createLabel, deleteLabel, updateLabel } from '@/stores/boardStore'
import { activeProject, addMember, removeMember, updateMemberRole } from '@/stores/projectStore'
import ColorPicker from './ColorPicker.vue'
import { getPlanLabel, canUseRoles } from '@/utils/subscriptionPlans'
import { user } from '@/stores/authStore'
import { t } from '@/utils/i18n'

  /* ── Tab state ── */
  const activeTab = ref('labels') // 'labels' | 'members'

/* ── Label state ── */
const newName  = ref('')
const newColor = ref('#5b5bd6')

function addLabel() {
  if (!newName.value.trim()) return
  createLabel(newName.value.trim(), newColor.value)
  newName.value  = ''
  newColor.value = '#5b5bd6'
}

const editingId = ref(null)
const editName  = ref('')
const editColor = ref('')

function startEdit(label) {
  editingId.value = label.id
  editName.value  = label.name
  editColor.value = label.color
}

function saveEdit() {
  if (editName.value.trim()) updateLabel(editingId.value, editName.value.trim(), editColor.value)
  editingId.value = null
}

/* ── Member state ── */
const memberEmail = ref('')
const memberRole  = ref('collaborator')
const memberError = ref('')
const rolesEnabled = computed(() => canUseRoles(user.subscriptionPlan))

async function inviteMember() {
  memberError.value = ''
  const email = memberEmail.value.trim().toLowerCase()
  if (!email || !email.includes('@')) { memberError.value = 'Voer een geldig e-mailadres in.'; return }
  const p = activeProject.value
  if (!p) return
  if (p.members.find(m => m.email === email)) { memberError.value = 'Deze gebruiker is al lid.'; return }
  try {
    await addMember(p.id, email, rolesEnabled.value ? memberRole.value : 'collaborator')
    memberEmail.value = ''
    memberRole.value  = 'collaborator'
  } catch (err) {
    memberError.value = err.message
  }
}

async function changeRole(memberId, role) {
  const p = activeProject.value
  if (p) await updateMemberRole(p.id, memberId, role)
}

async function kickMember(memberId) {
  const p = activeProject.value
  if (p) await removeMember(p.id, memberId)
}

const ROLES = [
  { value: 'owner', label: 'Eigenaar' },
  { value: 'admin', label: 'Admin' },
  { value: 'collaborator',  label: 'Lid' },
]

const isProjectMuted = computed(() => !!activeProject.value && mutedProjectIds.value.has(activeProject.value.id))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="ui.settingsOpen" class="settings-overlay" @click.self="closeSettings">
        <div class="settings-modal">

          <div class="settings-header">
            <span class="settings-title">Projectinstellingen</span>
            <span v-if="activeProject" class="project-plan-chip">{{ getPlanLabel(user.subscriptionPlan) }}</span>
            <button
              v-if="activeProject"
              class="settings-mute-btn"
              :class="{ 'settings-mute-btn--active': isProjectMuted }"
              :title="isProjectMuted ? t('enableProjectNotifications') : t('muteProjectNotifications')"
              @click="toggleMuteProject(activeProject.id)"
            >
              <svg v-if="!isProjectMuted" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <svg v-else width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                <line x1="3" y1="3" x2="21" y2="21" stroke-linecap="round"/>
              </svg>
              {{ isProjectMuted ? t('muted') : t('mute') }}
            </button>
            <button class="close-btn" @click="closeSettings">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="settings-body">
            <!-- Tabs -->
            <div class="tabs">
              <button
                class="tab"
                :class="{ 'tab--active': activeTab === 'labels' }"
                @click="activeTab = 'labels'"
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
                {{ t('labels') }}
              </button>
              <button
                class="tab"
                :class="{ 'tab--active': activeTab === 'members' }"
                @click="activeTab = 'members'"
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {{ t('membersTitle') }}
              </button>
            </div>

            <!-- ══ LABELS TAB ══ -->
            <div v-if="activeTab === 'labels'" class="tab-content">
              <div class="add-label-form">
                <p class="section-label">{{ t('addLabel') }}</p>
                <div class="add-label-row">
                  <input
                    v-model="newName"
                    type="text"
                    class="label-name-input"
                    :placeholder="t('labelNamePlaceholder')"
                    @keydown.enter="addLabel"
                  />
                  <ColorPicker v-model="newColor" />
                  <button class="btn-add" @click="addLabel" :disabled="!newName.trim()">{{ t('add') }}</button>
                </div>
              </div>

              <div class="label-list">
                <div v-if="projectLabels.length === 0" class="labels-empty">
                  {{ t('noLabels') }}
                </div>
                <div v-for="label in projectLabels" :key="label.id" class="label-row">
                  <template v-if="editingId === label.id">
                    <input
                      v-model="editName"
                      class="label-edit-input"
                      @keydown.enter="saveEdit"
                      @keydown.escape="editingId = null"
                    />
                    <ColorPicker v-model="editColor" />
                    <button class="label-action-btn" @click="saveEdit">{{ t('save') }}</button>
                    <button class="label-action-btn" @click="editingId = null">{{ t('cancel') }}</button>
                  </template>
                  <template v-else>
                    <span class="label-preview" :style="{ '--lc': label.color }">
                      <span class="label-dot"></span>
                      {{ label.name }}
                    </span>
                    <div class="label-row-actions">
                      <button class="icon-btn" @click="startEdit(label)" :title="t('edit')">
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                      <button class="icon-btn icon-btn--danger" @click="deleteLabel(label.id)" :title="t('delete')">
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <!-- ══ MEMBERS TAB ══ -->
            <div v-if="activeTab === 'members'" class="tab-content">

              <div class="members-actions-row">
                <button
                  class="settings-theme-btn"
                  @click="toggleTheme"
                  :title="ui.lightMode ? t('switchToDark') : t('switchToLight')"
                >
                  {{ ui.lightMode ? t('switchToDark') : t('switchToLight') }}
                </button>
              </div>

              <!-- Invite form -->
              <div class="add-label-form">
                <p class="section-label">{{ t('invite') }}</p>
                <div class="invite-row">
                  <input
                    v-model="memberEmail"
                    type="email"
                    class="label-name-input"
                    :placeholder="t('invitePlaceholder')"
                    @keydown.enter="inviteMember"
                  />
                  <select v-model="memberRole" class="role-select" :disabled="!rolesEnabled">
                    <option value="admin">Admin</option>
                    <option value="collaborator">Lid</option>
                  </select>
                  <button class="btn-add" @click="inviteMember">{{ t('invite') }}</button>
                </div>
                <p v-if="!rolesEnabled" class="member-note">{{ t('rolesAvailablePremium') }}</p>
                <p v-if="memberError" class="member-error">{{ memberError }}</p>
              </div>

              <!-- Members list -->
              <div class="label-list">
                <div
                  v-if="!activeProject || activeProject.members.length === 0"
                  class="labels-empty"
                >
                  {{ t('noMembers') }}
                </div>
                <div
                  v-for="m in (activeProject?.members ?? [])"
                  :key="m.id"
                  class="member-row"
                >
                  <div class="member-avatar">{{ (m.name || m.email)[0].toUpperCase() }}</div>
                  <div class="member-info">
                    <span class="member-name">{{ m.name || m.email }}</span>
                    <span class="member-email">{{ m.email }}</span>
                    <span class="member-plan">{{ getPlanLabel(m.subscriptionPlan) }}</span>
                  </div>
                  <select
                    class="role-select role-select--sm"
                    :value="m.role"
                    :disabled="m.role === 'owner' || !rolesEnabled"
                    @change="changeRole(m.id, $event.target.value)"
                    v-if="rolesEnabled || m.role === 'owner'"
                  >
                    <option value="owner" :disabled="m.role !== 'owner'">Eigenaar</option>
                    <option value="admin">Admin</option>
                    <option value="collaborator">Lid</option>
                  </select>
                  <button
                    v-if="m.role !== 'owner'"
                    class="icon-btn icon-btn--danger"
                    @click="kickMember(m.id)"
                    title="Lid verwijderen"
                  >
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.settings-modal {
  width: 100%;
  max-width: 540px;
  max-height: calc(100vh - 48px);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-sub);
  flex-shrink: 0;
}
.settings-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-1);
}
.project-plan-chip {
  margin-left: auto;
}
.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-3);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.close-btn:hover {
  background: var(--color-surface-3);
  color: var(--color-text-1);
}
.settings-mute-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-3);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.settings-mute-btn:hover { background: color-mix(in srgb, #f5c842 15%, transparent); color: #f5c842; border-color: color-mix(in srgb, #f5c842 40%, transparent); }
.settings-mute-btn--active { color: #f5c842; border-color: color-mix(in srgb, #f5c842 40%, transparent); }
.settings-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}
.tabs {
  display: flex;
  padding: 10px 20px 0;
  border-bottom: 1px solid var(--color-border-sub);
  gap: 4px;
  flex-shrink: 0;
}
.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-2);
  border: none;
  border-radius: 6px 6px 0 0;
  background: transparent;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.15s;
}
.tab--active {
  color: var(--color-text-1);
  border-bottom-color: var(--color-accent);
}
.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.section-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-2);
  margin-bottom: 10px;
}
.add-label-form {
  background: var(--color-surface-1);
  border: 1px solid var(--color-border-sub);
  border-radius: 8px;
  padding: 14px;
}
.add-label-row,
.invite-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.label-name-input,
.label-edit-input {
  height: 34px;
  padding: 0 10px;
  background: var(--color-surface-0);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 13px;
  color: var(--color-text-1);
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  font-family: inherit;
}
.label-name-input::placeholder,
.label-edit-input::placeholder {
  color: var(--color-text-3);
}
.label-name-input:focus,
.label-edit-input:focus {
  border-color: var(--color-accent);
}
.btn-add {
  height: 32px;
  padding: 0 14px;
  border-radius: 6px;
  border: none;
  background: var(--color-accent);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
  align-self: flex-start;
}
.btn-add:hover { background: var(--color-accent-hover); }
.btn-add:disabled { opacity: 0.35; cursor: not-allowed; }

/* Role select */
.role-select {
  height: 34px;
  padding: 0 8px;
  background: var(--color-surface-0);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 13px;
  color: var(--color-text-1);
  outline: none;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s;
}
.role-select:focus { border-color: var(--color-accent); }
.role-select--sm { height: 28px; font-size: 12px; }

/* Member row */
.member-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--color-surface-1);
  border: 1px solid transparent;
}
.member-row:hover { border-color: var(--color-border-sub); }
.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-accent-muted);
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.member-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.member-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.member-email {
  font-size: 11px;
  color: var(--color-text-3);
  white-space: nowrap;
.member-plan {
  display: inline-flex;
  width: fit-content;
  margin-top: 4px;
  padding: 2px 7px;
  border-radius: 99px;
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  color: var(--color-accent);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.member-note {
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-text-3);
}
  overflow: hidden;
  text-overflow: ellipsis;
}
.member-error {
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-danger);
}

.members-actions-row {
  display: flex;
  justify-content: flex-end;
}

.settings-theme-btn {
  height: 30px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-2);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.settings-theme-btn:hover {
  background: var(--color-surface-3);
  color: var(--color-text-1);
}

/* Label rows */
.label-list { display: flex; flex-direction: column; gap: 4px; }
.labels-empty {
  font-size: 13px;
  color: var(--color-text-3);
  font-style: italic;
  padding: 8px 0;
}
.label-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: var(--color-surface-1);
  flex-wrap: wrap;
}
.label-row:hover { border-color: var(--color-border-sub); }
.label-preview {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-1);
  flex: 1;
}
.label-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--lc, #8a8a9a);
  flex-shrink: 0;
}
.label-row-actions { display: flex; gap: 2px; margin-left: auto; }
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 5px;
  border: none;
  background: transparent;
  color: var(--color-text-3);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.icon-btn:hover { background: var(--color-surface-3); color: var(--color-text-1); }
.icon-btn--danger:hover { background: var(--color-danger-bg); color: var(--color-danger); }
.label-action-btn {
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid var(--color-border);
  background: transparent;
  font-size: 12px;
  color: var(--color-text-2);
  cursor: pointer;
  transition: background 0.15s;
}
.label-action-btn:hover { background: var(--color-surface-3); }

.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }
</style>
