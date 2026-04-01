<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { isLoggedIn } from '@/stores/authStore'
import { preferences, updatePreferences } from '@/stores/preferencesStore'

const settingsOpen = ref(false)
const settingsRef = ref(null)

const labels = computed(() => {
  if (preferences.language === 'en') {
    return {
      home: 'Home',
      about: 'About',
      contact: 'Contact',
      guestApp: 'Open app (guest)',
      login: 'Log in',
      start: 'Get started',
      openApp: 'Open app',
      settings: 'Settings',
      appearance: 'Appearance',
      language: 'Language',
      light: 'Light',
      dark: 'Dark',
      dutch: 'Nederlands',
      english: 'English',
    }
  }

  return {
    home: 'Home',
    about: 'Over',
    contact: 'Contact',
    guestApp: 'Open app (gast)',
    login: 'Inloggen',
    start: 'Start gratis',
    openApp: 'Open app',
    settings: 'Instellingen',
    appearance: 'Weergave',
    language: 'Taal',
    light: 'Licht',
    dark: 'Donker',
    dutch: 'Nederlands',
    english: 'English',
  }
})

async function setTheme(theme) {
  if (preferences.theme === theme) return
  await updatePreferences({ theme }, { persist: isLoggedIn.value })
}

async function setLanguage(language) {
  if (preferences.language === language) return
  await updatePreferences({ language }, { persist: isLoggedIn.value })
}

function toggleSettingsMenu() {
  settingsOpen.value = !settingsOpen.value
}

function closeSettingsMenu() {
  settingsOpen.value = false
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
  <header class="pub-nav">
    <router-link to="/" class="pub-brand">
      <img src="/logo.png" alt="TaskPilot logo" width="26" height="26" />
      <span>TaskPilot</span>
    </router-link>

    <nav class="pub-links">
      <router-link to="/" exact-active-class="pub-link--active" class="pub-link">{{ labels.home }}</router-link>
      <router-link to="/about" active-class="pub-link--active" class="pub-link">{{ labels.about }}</router-link>
      <router-link to="/contact" active-class="pub-link--active" class="pub-link">{{ labels.contact }}</router-link>

      <div class="pub-settings" ref="settingsRef">
        <button class="settings-gear-btn" @click.stop="toggleSettingsMenu" :title="labels.settings" :aria-label="labels.settings">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.572c1.756.427 1.756 2.925 0 3.352a1.724 1.724 0 00-1.066 2.572c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.572-1.066c-1.544.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.067-2.572c-1.756-.427-1.756-2.925 0-3.352a1.724 1.724 0 001.066-2.572c-.94-1.544.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <Transition name="settings-menu">
          <div v-if="settingsOpen" class="settings-menu" @click.stop>
            <div class="settings-group">
              <p class="settings-label">{{ labels.appearance }}</p>
              <div class="toggle-row">
                <button class="toggle-pill" :class="{ 'toggle-pill--active': preferences.theme === 'light' }" @click="setTheme('light')">{{ labels.light }}</button>
                <button class="toggle-pill" :class="{ 'toggle-pill--active': preferences.theme === 'dark' }" @click="setTheme('dark')">{{ labels.dark }}</button>
              </div>
            </div>
            <div class="settings-group">
              <p class="settings-label">{{ labels.language }}</p>
              <div class="toggle-row">
                <button class="toggle-pill" :class="{ 'toggle-pill--active': preferences.language === 'nl' }" @click="setLanguage('nl')">{{ labels.dutch }}</button>
                <button class="toggle-pill" :class="{ 'toggle-pill--active': preferences.language === 'en' }" @click="setLanguage('en')">{{ labels.english }}</button>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <template v-if="!isLoggedIn">
        <router-link :to="{ name: 'dashboard', query: { guest: '1' } }" class="pub-btn pub-btn--ghost">{{ labels.guestApp }}</router-link>
        <router-link to="/login" class="pub-btn pub-btn--ghost">{{ labels.login }}</router-link>
        <router-link to="/register" class="pub-btn pub-btn--primary">{{ labels.start }}</router-link>
      </template>
      <template v-else>
        <router-link to="/projects" class="pub-btn pub-btn--primary">{{ labels.openApp }}</router-link>
      </template>
    </nav>
  </header>
</template>

<style scoped>
.pub-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 48px;
  height: 60px;
  border-bottom: 1px solid var(--color-border-sub);
  position: sticky;
  top: 0;
  background: var(--color-surface-0);
  z-index: 10;
  flex-shrink: 0;
}

.pub-brand {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-1);
  text-decoration: none;
  letter-spacing: -0.02em;
}

.pub-links {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pub-settings {
  position: relative;
  margin-left: 4px;
}

.settings-gear-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 7px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-2);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.settings-gear-btn:hover {
  background: var(--color-surface-2);
  color: var(--color-text-1);
}

.settings-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
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

.pub-link {
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-2);
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
}
.pub-link:hover {
  color: var(--color-text-1);
  background: var(--color-surface-2);
}
.pub-link--active {
  color: var(--color-text-1);
  background: var(--color-surface-2);
}

.pub-btn {
  padding: 6px 14px;
  border-radius: 7px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  margin-left: 4px;
}
.pub-btn--ghost {
  color: var(--color-text-1);
  border: 1px solid var(--color-border);
  background: transparent;
}
.pub-btn--ghost:hover {
  background: var(--color-surface-2);
}
.pub-btn--primary {
  background: var(--color-accent);
  color: #fff;
  border: 1px solid transparent;
}
.pub-btn--primary:hover {
  background: var(--color-accent-hover, #4e4ec2);
}
</style>
