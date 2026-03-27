<script setup>
import { computed } from 'vue'
import { i18n, t, toggleLanguage } from '@/stores/i18nStore'
import { ui, toggleTheme } from '@/stores/uiStore'

const themeTitle = computed(() => (ui.lightMode ? t('switchToDark') : t('switchToLight')))
const langTitle = computed(() => (i18n.language === 'nl' ? t('switchToEnglish') : t('switchToDutch')))
</script>

<template>
  <div class="global-controls" aria-label="Global controls">
    <button class="control-btn" :title="themeTitle" @click="toggleTheme">
      <svg v-if="ui.lightMode" width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      <svg v-else width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0" />
      </svg>
    </button>

    <button class="control-btn control-btn--lang" :title="langTitle" @click="toggleLanguage">
      {{ i18n.language === 'nl' ? 'NL' : 'EN' }}
    </button>
  </div>
</template>

<style scoped>
.global-controls {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border-radius: 9px;
  background: var(--color-surface-1);
  border: 1px solid var(--color-border);
}

:global(html.light-mode) .global-controls {
  background: #f9fafb !important;
  border-color: #cbd5e1 !important;
}

.control-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  color: var(--color-text-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

:global(html.light-mode) .control-btn {
  background: #f1f5f9 !important;
  color: #475569 !important;
  border-color: #cbd5e1 !important;
}

.control-btn:hover {
  background: var(--color-surface-3);
  color: var(--color-text-1);
}

:global(html.light-mode) .control-btn:hover {
  background: #e2e8f0 !important;
  color: #0f172a !important;
}

.control-btn--lang {
  width: 38px;
}
</style>
