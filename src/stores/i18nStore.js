import { reactive } from 'vue'

const messages = {
  nl: {
    switchToDark: 'Naar donkere modus',
    switchToLight: 'Naar lichte modus',
    switchToEnglish: 'Naar Engels',
    switchToDutch: 'Naar Nederlands',
    languageDutch: 'Nederlands',
    languageEnglish: 'Engels',
    projects: 'Projecten',
    projectSettings: 'Projectinstellingen',
    navHome: 'Home',
    navAbout: 'Over',
    navContact: 'Contact',
    navLogin: 'Inloggen',
    navGetStarted: 'Beginnen',
    navOpenApp: 'Open app',
  },
  en: {
    switchToDark: 'Switch to dark mode',
    switchToLight: 'Switch to light mode',
    switchToEnglish: 'Switch to English',
    switchToDutch: 'Switch to Dutch',
    languageDutch: 'Dutch',
    languageEnglish: 'English',
    projects: 'Projects',
    projectSettings: 'Project Settings',
    navHome: 'Home',
    navAbout: 'About',
    navContact: 'Contact',
    navLogin: 'Log in',
    navGetStarted: 'Get started',
    navOpenApp: 'Open app',
  },
}

export const i18n = reactive({
  language: 'nl',
})

let languageTransitionTimer = null

export function t(key) {
  return messages[i18n.language]?.[key] || messages.nl[key] || key
}

export function toggleLanguage() {
  i18n.language = i18n.language === 'nl' ? 'en' : 'nl'
  applyLanguage()

  const root = document.documentElement
  root.classList.add('lang-transition')
  if (languageTransitionTimer) clearTimeout(languageTransitionTimer)
  languageTransitionTimer = setTimeout(() => {
    root.classList.remove('lang-transition')
  }, 240)
}

export function applyLanguage() {
  document.documentElement.lang = i18n.language
}
