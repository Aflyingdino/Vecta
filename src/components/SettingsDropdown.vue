<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ui, setLanguage, setThemeMode } from '@/stores/uiStore'
import { t } from '@/utils/i18n'

const open = ref(false)
const rootEl = ref(null)

function closeMenu() {
  open.value = false
}

function toggleMenu() {
  open.value = !open.value
}

function onDocumentClick(event) {
  if (!open.value || !rootEl.value) return
  if (!rootEl.value.contains(event.target)) {
    closeMenu()
  }
}

function onDocumentKeydown(event) {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

function setTheme(theme) {
  setThemeMode(theme)
}

function setLang(language) {
  setLanguage(language)
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onDocumentKeydown)
})
</script>

<template>
  <div class="settings-menu" ref="rootEl">
    <button
      class="settings-trigger"
      type="button"
      :aria-expanded="open"
      :aria-label="t('settingsAria')"
      @click="toggleMenu"
    >
      <span class="settings-icon" aria-hidden="true"></span>
    </button>

    <Transition name="dropdown">
      <div v-if="open" class="settings-panel" role="menu">
        <p class="settings-title">{{ t('settings') }}</p>

        <div class="settings-group">
          <p class="settings-group-title">{{ t('appearance') }}</p>
          <div class="settings-options">
            <button class="option-btn" :class="{ 'option-btn--active': ui.lightMode }" @click="setTheme('light')" type="button">
              {{ t('light') }}
            </button>
            <button class="option-btn" :class="{ 'option-btn--active': !ui.lightMode }" @click="setTheme('dark')" type="button">
              {{ t('dark') }}
            </button>
          </div>
        </div>

        <div class="settings-group">
          <p class="settings-group-title">{{ t('language') }}</p>
          <div class="settings-options">
            <button class="option-btn" :class="{ 'option-btn--active': ui.language === 'nl' }" @click="setLang('nl')" type="button">
              {{ t('dutch') }}
            </button>
            <button class="option-btn" :class="{ 'option-btn--active': ui.language === 'en' }" @click="setLang('en')" type="button">
              {{ t('english') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.settings-menu {
  position: relative;
}

.settings-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-1);
  color: var(--color-text-2);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s, box-shadow 0.15s;
}

.settings-icon {
  width: 18px;
  height: 18px;
  display: block;
  background-color: currentColor;
  -webkit-mask: url('/cog.svg') center / contain no-repeat;
  mask: url('/cog.svg') center / contain no-repeat;
}

.settings-trigger:hover {
  background: color-mix(in srgb, var(--color-surface-2) 88%, #fff 12%);
  color: var(--color-text-1);
  border-color: color-mix(in srgb, var(--color-border) 82%, var(--color-accent) 18%);
}

.settings-trigger[aria-expanded='true'] {
  color: var(--color-accent);
  border-color: color-mix(in srgb, var(--color-accent) 45%, var(--color-border));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 20%, transparent);
}

.settings-panel {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  min-width: 244px;
  background: var(--color-surface-1);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 12px;
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.2);
  z-index: 60;
}

.settings-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}

.settings-group {
  padding-top: 10px;
  margin-top: 10px;
  border-top: 1px solid var(--color-border-sub);
}

.settings-group-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-2);
  margin-bottom: 8px;
}

.settings-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.option-btn {
  border: 1px solid var(--color-border);
  background: var(--color-surface-0);
  color: var(--color-text-2);
  border-radius: 10px;
  height: 34px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s, box-shadow 0.15s;
}

.option-btn:hover {
  background: var(--color-surface-2);
  color: var(--color-text-1);
}

.option-btn--active {
  color: var(--color-accent);
  border-color: color-mix(in srgb, var(--color-accent) 55%, var(--color-border));
  background: color-mix(in srgb, var(--color-accent) 15%, var(--color-surface-0));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-accent) 26%, transparent);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.18s ease, transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  transform-origin: top left;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}
</style>
