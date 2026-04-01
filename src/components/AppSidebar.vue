<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { projects, activeProjectId } from '@/stores/projectStore'
import { isLoggedIn, user, logout } from '@/stores/authStore'
import { preferences, updatePreferences } from '@/stores/preferencesStore'

const router = useRouter()
const route = useRoute()

const collapsed = ref(localStorage.getItem('tp_sidebar_collapsed') === '1')
const settingsOpen = ref(false)
const settingsRef = ref(null)

function toggleCollapse() {
  collapsed.value = !collapsed.value
  localStorage.setItem('tp_sidebar_collapsed', collapsed.value ? '1' : '0')
  if (collapsed.value) settingsOpen.value = false
}

function toggleSettingsMenu() {
  settingsOpen.value = !settingsOpen.value
}

function closeSettingsMenu() {
  settingsOpen.value = false
}

async function setTheme(theme) {
  if (preferences.theme === theme) return
  await updatePreferences({ theme }, { persist: isLoggedIn.value })
}

async function setLanguage(language) {
  if (preferences.language === language) return
  await updatePreferences({ language }, { persist: isLoggedIn.value })
}

function onDocumentClick(event) {
  if (!settingsOpen.value) return
  if (!settingsRef.value?.contains(event.target)) {
    closeSettingsMenu()
  }
}

function onEscape(event) {
  if (event.key === 'Escape') {
    closeSettingsMenu()
  }
}

const currentProjectId = computed(() =>
  route.params.id ? Number(route.params.id) : null
)

const navLinks = [
  { name: 'dashboard', labelNl: 'Dashboard', labelEn: 'Dashboard', icon: 'dashboard' },
  { name: 'projects',  labelNl: 'Projecten', labelEn: 'Projects',  icon: 'grid' },
  { name: 'calendar',  labelNl: 'Kalender', labelEn: 'Calendar',  icon: 'calendar' },
]

const labels = computed(() => {
  if (preferences.language === 'en') {
    return {
      menu: 'Menu',
      projects: 'Projects',
      expand: 'Expand sidebar',
      collapse: 'Collapse sidebar',
      settings: 'Settings',
      appearance: 'Appearance',
      language: 'Language',
      light: 'Light',
      dark: 'Dark',
      dutch: 'Nederlands',
      english: 'English',
      logout: 'Log out',
    }
  }

  return {
    menu: 'Menu',
    projects: 'Projecten',
    expand: 'Sidebar uitklappen',
    collapse: 'Sidebar inklappen',
    settings: 'Instellingen',
    appearance: 'Weergave',
    language: 'Taal',
    light: 'Licht',
    dark: 'Donker',
    dutch: 'Nederlands',
    english: 'English',
    logout: 'Uitloggen',
  }
})

function navLabel(link) {
  return preferences.language === 'en' ? link.labelEn : link.labelNl
}

function isActive(name) {
  return route.name === name
}

function isBoardActive(projectId) {
  return route.name === 'board' && Number(route.params.id) === projectId
}

async function handleLogout() {
  await logout()
  router.push({ name: 'home' })
}

const userInitials = computed(() => {
  if (!user.name) return '?'
  return user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
})

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onEscape)
})
</script>

<template>
  <nav class="sidebar" :class="{ 'sidebar--collapsed': collapsed }">
    <!-- Logo -->
    <div class="sidebar-logo" :class="{ 'sidebar-logo--collapsed': collapsed }">
      <router-link v-if="!collapsed" to="/" class="logo-link">
        <img src="/logo.png" alt="TaskPilot logo" width="28" height="28" />
        <span class="logo-text">TaskPilot</span>
      </router-link>
      <div class="logo-controls" :class="{ 'logo-controls--collapsed': collapsed }" ref="settingsRef">
        <button
          class="settings-gear-btn"
          @click.stop="toggleSettingsMenu"
          :title="labels.settings"
          :aria-label="labels.settings"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.572c1.756.427 1.756 2.925 0 3.352a1.724 1.724 0 00-1.066 2.572c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.572-1.066c-1.544.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.067-2.572c-1.756-.427-1.756-2.925 0-3.352a1.724 1.724 0 001.066-2.572c-.94-1.544.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <Transition name="settings-menu">
          <div v-if="settingsOpen && !collapsed" class="settings-menu" @click.stop>
            <div class="settings-group">
              <p class="settings-label">{{ labels.appearance }}</p>
              <div class="toggle-row">
                <button class="toggle-pill" :class="{ 'toggle-pill--active': preferences.theme === 'light' }" @click="setTheme('light')">
                  {{ labels.light }}
                </button>
                <button class="toggle-pill" :class="{ 'toggle-pill--active': preferences.theme === 'dark' }" @click="setTheme('dark')">
                  {{ labels.dark }}
                </button>
              </div>
            </div>
            <div class="settings-group">
              <p class="settings-label">{{ labels.language }}</p>
              <div class="toggle-row">
                <button class="toggle-pill" :class="{ 'toggle-pill--active': preferences.language === 'nl' }" @click="setLanguage('nl')">
                  {{ labels.dutch }}
                </button>
                <button class="toggle-pill" :class="{ 'toggle-pill--active': preferences.language === 'en' }" @click="setLanguage('en')">
                  {{ labels.english }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
        <button class="collapse-btn" @click="toggleCollapse" :title="collapsed ? labels.expand : labels.collapse" :aria-label="collapsed ? labels.expand : labels.collapse">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" :d="collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Main nav -->
    <div class="sidebar-section">
      <p class="section-label" v-if="!collapsed">{{ labels.menu }}</p>
      <router-link
        v-for="link in navLinks"
        :key="link.name"
        :to="{ name: link.name }"
        class="nav-item"
        :class="{ 'nav-item--active': isActive(link.name) }"
        :title="collapsed ? navLabel(link) : ''"
      >
        <!-- Grid icon -->
        <svg v-if="link.icon === 'grid'" width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
        <!-- Dashboard icon -->
        <svg v-if="link.icon === 'dashboard'" width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-9v9m3-12v12M3 12l18-9-9 18 9-9-18-9z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12z" />
        </svg>
        <!-- Calendar icon -->
        <svg v-if="link.icon === 'calendar'" width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        <span v-if="!collapsed">{{ navLabel(link) }}</span>
      </router-link>
    </div>

    <!-- Projects list -->
    <div class="sidebar-section sidebar-section--projects" v-if="projects.length">
      <p class="section-label" v-if="!collapsed">{{ labels.projects }}</p>
      <router-link
        v-for="project in projects"
        :key="project.id"
        :to="{ name: 'board', params: { id: project.id } }"
        class="nav-item nav-item--project"
        :class="{ 'nav-item--active': isBoardActive(project.id) }"
        :title="project.name"
      >
        <span class="project-dot" :style="{ background: project.color }"></span>
        <span v-if="!collapsed" class="project-name">{{ project.name }}</span>
        <span v-else class="project-collapsed-hint">···</span>
      </router-link>
    </div>

    <!-- Bottom: user -->
    <div class="sidebar-bottom">
      <div class="user-row" :class="{ 'user-row--collapsed': collapsed }">
        <div class="user-avatar">{{ userInitials }}</div>
        <div class="user-info" v-if="!collapsed">
          <p class="user-name">{{ user.name }}</p>
          <p class="user-email">{{ user.email }}</p>
        </div>
        <button v-if="!collapsed" class="logout-btn" @click="handleLogout" :title="labels.logout">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>
    </div>
  </nav>


</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: 220px;
  min-width: 220px;
  height: 100vh;
  background: var(--color-surface-1);
  border-right: 1px solid var(--color-border);
  transition: width 0.2s, min-width 0.2s;
  overflow: hidden;
  position: sticky;
  top: 0;
  flex-shrink: 0;
}
.sidebar--collapsed {
  width: 56px;
  min-width: 56px;
}

/* Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 12px;
  border-bottom: 1px solid var(--color-border-sub);
  flex-shrink: 0;
}
.sidebar-logo--collapsed {
  justify-content: center;
  padding: 14px 0;
}
.logo-controls {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
}
.logo-controls--collapsed {
  gap: 0;
}
.logo-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  min-width: 0;
}
.logo-text {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-1);
  white-space: nowrap;
  overflow: hidden;
}
.settings-gear-btn,
.collapse-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--color-text-3);
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}
.settings-gear-btn:hover,
.collapse-btn:hover { background: var(--color-surface-3); color: var(--color-text-1); }

.settings-menu {
  position: absolute;
  right: 32px;
  top: calc(100% + 8px);
  width: 230px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.24);
  z-index: 120;
}
.settings-group + .settings-group {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border-sub);
}
.settings-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: var(--color-text-2);
  margin-bottom: 8px;
}
.toggle-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.toggle-pill {
  border: 1px solid var(--color-border);
  background: var(--color-surface-1);
  color: var(--color-text-2);
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  padding: 7px 8px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.toggle-pill:hover {
  border-color: var(--color-accent);
  color: var(--color-text-1);
}
.toggle-pill--active {
  background: var(--color-accent-muted);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.settings-menu-enter-active,
.settings-menu-leave-active {
  transition: opacity 0.18s ease, transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  transform-origin: top right;
}
.settings-menu-enter-from,
.settings-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}

/* Sections */
.sidebar-section {
  padding: 10px 8px 4px;
}
.sidebar-section--projects {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 0;
}
.section-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-3);
  padding: 0 6px;
  margin-bottom: 4px;
}

/* Nav items */
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 8px;
  border-radius: 6px;
  text-decoration: none;
  color: var(--color-text-2);
  font-size: 13px;
  font-weight: 500;
  transition: background 0.1s, color 0.1s;
  white-space: nowrap;
  overflow: hidden;
}
.nav-item:hover { background: var(--color-surface-3); color: var(--color-text-1); }
.nav-item--active { background: var(--color-accent-muted); color: var(--color-accent); }
.nav-item--active:hover { background: var(--color-accent-muted); }

/* Project items */
.nav-item--project { font-size: 13px; }
.project-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.project-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.project-collapsed-hint {
  font-size: 10px;
  color: var(--color-text-3);
  letter-spacing: 0.05em;
  font-weight: 700;
}

/* Bottom user */
.sidebar-bottom {
  padding: 10px 8px;
  border-top: 1px solid var(--color-border-sub);
  flex-shrink: 0;
}
.user-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  min-width: 0;
}
.user-row--collapsed { padding: 6px 0; justify-content: center; }
.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--color-accent);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.user-info {
  flex: 1;
  min-width: 0;
}
.user-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user-email {
  font-size: 11px;
  color: var(--color-text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.logout-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--color-text-3);
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}
.logout-btn:hover { background: var(--color-danger-bg); color: var(--color-danger); }
</style>
