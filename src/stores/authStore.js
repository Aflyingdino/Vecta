import { reactive, computed, readonly } from 'vue'
import { api } from '@/utils/api'

/* ─────────────────────────────────────────────
   Auth Store — session-based via PHP backend
───────────────────────────────────────────── */

const _state = reactive({
  id: null,
  name: '',
  email: '',
<<<<<<< Updated upstream
=======
  subscriptionPlan: 'free',
  subscriptionStartedAt: null,
  subscriptionExpiresAt: null,
  subscriptionNextPlan: null,
  subscriptionNextStartsAt: null,
  subscriptionNextExpiresAt: null,
>>>>>>> Stashed changes
  avatar: null,
  isLoggedIn: false,
  loading: false,
  error: null,
})

export const user = readonly(_state)
export const isLoggedIn = computed(() => _state.isLoggedIn)
export const authLoading = computed(() => _state.loading)
export const authError = computed(() => _state.error)

<<<<<<< Updated upstream
=======
function applyAuthUser(data) {
  Object.assign(_state, {
    id: data.id,
    name: data.name,
    email: data.email,
    subscriptionPlan: data.subscriptionPlan || 'free',
    subscriptionStartedAt: data.subscriptionStartedAt || null,
    subscriptionExpiresAt: data.subscriptionExpiresAt || null,
    subscriptionNextPlan: data.subscriptionNextPlan || null,
    subscriptionNextStartsAt: data.subscriptionNextStartsAt || null,
    subscriptionNextExpiresAt: data.subscriptionNextExpiresAt || null,
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

>>>>>>> Stashed changes
/**
 * Restore session from server cookie on app startup.
 * Returns true if a valid session exists.
 */
export async function checkSession() {
  try {
    const data = await api.get('/auth/me')
    Object.assign(_state, {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: null,
      isLoggedIn: true,
    })
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
    Object.assign(_state, {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: null,
      isLoggedIn: true,
    })
  } catch (err) {
    _state.error = err.message
    throw err
  } finally {
    _state.loading = false
  }
}

export async function register({ name, email, password, subscriptionPlan = 'free' }) {
  _state.loading = true
  _state.error = null
  try {
<<<<<<< Updated upstream
    const data = await api.post('/auth/register', { name, email, password })
    Object.assign(_state, {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: null,
      isLoggedIn: true,
    })
=======
    const data = await api.post('/auth/register', { name, email, password, subscriptionPlan })
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
>>>>>>> Stashed changes
  } catch (err) {
    _state.error = err.message
    throw err
  } finally {
    _state.loading = false
  }
}

export async function logout() {
  try { await api.post('/auth/logout') } catch { /* ignore */ }
  Object.assign(_state, {
<<<<<<< Updated upstream
    id: null, name: '', email: '', avatar: null,
=======
    id: null, name: '', email: '', subscriptionPlan: 'free', subscriptionStartedAt: null, subscriptionExpiresAt: null, subscriptionNextPlan: null, subscriptionNextStartsAt: null, subscriptionNextExpiresAt: null, avatar: null,
>>>>>>> Stashed changes
    isLoggedIn: false, error: null,
  })
}

export function clearAuthError() {
  _state.error = null
}
