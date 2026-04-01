import { reactive, readonly } from 'vue'
import { api } from '@/utils/api'

const _preferences = reactive({
  theme: 'light',
  language: 'nl',
  saving: false,
})

function normalizeTheme(value) {
  return value === 'dark' ? 'dark' : 'light'
}

function normalizeLanguage(value) {
  return value === 'en' ? 'en' : 'nl'
}

function applyTheme(theme, withTransition = false) {
  const root = document.documentElement

  if (withTransition) {
    root.classList.add('theme-switching')
  }

  root.setAttribute('data-theme', normalizeTheme(theme))

  if (withTransition) {
    window.setTimeout(() => {
      root.classList.remove('theme-switching')
    }, 220)
  }
}

export const preferences = readonly(_preferences)

export function applyPreferencesFromAccount(data = {}) {
  _preferences.theme = normalizeTheme(data.preferredTheme)
  _preferences.language = normalizeLanguage(data.preferredLanguage)
  applyTheme(_preferences.theme, false)
}

export async function updatePreferences(next = {}, options = {}) {
  const { persist = true } = options
  const nextTheme = normalizeTheme(next.theme ?? _preferences.theme)
  const nextLanguage = normalizeLanguage(next.language ?? _preferences.language)

  _preferences.theme = nextTheme
  _preferences.language = nextLanguage
  applyTheme(nextTheme, true)

  if (!persist) {
    return
  }

  _preferences.saving = true
  try {
    const data = await api.patch('/auth/preferences', {
      theme: nextTheme,
      language: nextLanguage,
    })

    _preferences.theme = normalizeTheme(data.preferredTheme)
    _preferences.language = normalizeLanguage(data.preferredLanguage)
    applyTheme(_preferences.theme, false)
  } finally {
    _preferences.saving = false
  }
}