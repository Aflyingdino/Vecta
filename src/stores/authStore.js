import { reactive, computed, readonly } from 'vue'
import { api } from '@/utils/api'
import { getDemoUser, isDemoModeEnabled, resetDemoState, setDemoModeEnabled } from '@/utils/demoMode'
import { projects } from './projectStore'

/* ─────────────────────────────────────────────
   Auth Store — session-based via PHP backend
───────────────────────────────────────────── */

const _state = reactive({
  id: null,
  name: '',
  email: '',
  subscriptionPlan: 'free',
  avatar: null,
  isLoggedIn: false,
  loading: false,
  error: null,
})

export const user = readonly(_state)
export const isLoggedIn = computed(() => _state.isLoggedIn)
export const authLoading = computed(() => _state.loading)
export const authError = computed(() => _state.error)

function applyAuthUser(data) {
  Object.assign(_state, {
    id: data.id,
    name: data.name,
    email: data.email,
    subscriptionPlan: data.subscriptionPlan || 'free',
    avatar: null,
    isLoggedIn: true,
  })
}

function syncSubscriptionPlan(subscriptionPlan) {
  for (const project of projects.value) {
    const member = project.members?.find((item) => item.id === _state.id)
    if (member) {
      member.subscriptionPlan = subscriptionPlan
    }
  }
}

/**
 * Restore session from server cookie on app startup.
 * Returns true if a valid session exists.
 */
export async function checkSession() {
  if (isDemoModeEnabled()) {
    applyAuthUser(getDemoUser())
    syncSubscriptionPlan(_state.subscriptionPlan)
    return true
  }

  try {
    const data = await api.get('/auth/me')
    applyAuthUser(data)
    return true
  } catch {
    return false
  }
}

export async function login(email, password) {
  _state.loading = true
  _state.error = null
  try {
    const data = await api.post('/auth/login', { email, password })
    applyAuthUser(data)
  } catch (err) {
    _state.error = err.message
    throw err
  } finally {
    _state.loading = false
  }
}

export async function register({ name, email, password }) {
  _state.loading = true
  _state.error = null
  try {
    const data = await api.post('/auth/register', { name, email, password })
    applyAuthUser(data)
  } catch (err) {
    _state.error = err.message
    throw err
  } finally {
    _state.loading = false
  }
}

export async function loginLocalDemo() {
  _state.loading = true
  _state.error = null

  try {
    setDemoModeEnabled(true)
    resetDemoState()
    applyAuthUser(getDemoUser())
    syncSubscriptionPlan(_state.subscriptionPlan)
  } catch (err) {
    _state.error = err.message
    throw err
  } finally {
    _state.loading = false
  }
}

export async function updateSubscriptionPlan(subscriptionPlan) {
  _state.loading = true
  _state.error = null

  try {
    const data = await api.patch('/auth/subscription', { subscriptionPlan })
    applyAuthUser(data)
    syncSubscriptionPlan(data.subscriptionPlan || subscriptionPlan)
  } catch (err) {
    _state.error = err.message
    throw err
  } finally {
    _state.loading = false
  }
}

export async function logout() {
  try { await api.post('/auth/logout') } catch { /* ignore */ }
  setDemoModeEnabled(false)
  Object.assign(_state, {
    id: null, name: '', email: '', subscriptionPlan: 'free', avatar: null,
    isLoggedIn: false, error: null,
  })
}

export function clearAuthError() {
  _state.error = null
}
