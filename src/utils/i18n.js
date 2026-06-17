import nl from '@/locales/nl.json'
import en from '@/locales/en.json'
import { ui } from '@/stores/uiStore'

const messages = {
  nl,
  en,
}

export function t(key) {
  const locale = ui.language === 'en' ? 'en' : 'nl'
  return messages[locale]?.[key] ?? messages.nl[key] ?? key
}
