/**
 * Shared application constants
 * Single source of truth for status, priority, and other domain enumerations.
 */

/** Default locale used across date/time formatting in the UI. */
export const APP_LOCALE = 'nl-NL'

/** Task statuses with display metadata. */
export const STATUS_META = {
  not_started:    { label: 'Niet gestart',  color: '#8a8a9a' },
  started:        { label: 'Bezig',         color: '#5b5bd6' },
  ready_for_test: { label: 'Bezig',         color: '#5b5bd6' },
  done:           { label: 'Klaar',         color: '#46a758' },
}

/** Status values that should be treated as in-progress throughout dashboards/filters. */
export const IN_PROGRESS_STATUSES = ['started', 'ready_for_test']

export function isInProgressStatus(status) {
  return IN_PROGRESS_STATUSES.includes(status)
}

/** Task statuses as an ordered array for <select> / <option> elements. */
export const STATUS_OPTIONS = Object.entries(STATUS_META)
  .filter(([value]) => value !== 'ready_for_test')
  .map(([value, { label }]) => ({
  value,
  label,
}))

/** Group / task priority levels. */
export const PRIORITY_OPTIONS = [
  { value: 'low',     label: '↓ Laag' },
  { value: 'medium',  label: '→ Gemiddeld' },
  { value: 'high',    label: '↑ Hoog' },
  { value: 'urgent', label: '!! Urgent' },
]

/** Default accent colors available project-wide. */
export const PRESET_COLORS = [
  '#e5484d', '#f76b15', '#f5c842', '#46a758',
  '#5b5bd6', '#8e4ec6', '#e93d82', '#12a594',
  '#5eb1ef', '#3e63dd', '#d4a017', '#ff8c00',
  '#52525f', '#ffffff',
]
