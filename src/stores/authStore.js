import { reactive, computed, readonly } from 'vue'

/* ─────────────────────────────────────────────
   Auth Store — mock implementation
   Replace API_CALL markers with real fetch() calls
   when the FastAPI backend is connected.
───────────────────────────────────────────── */

const _state = reactive({
  id: null,
  name: '',
  email: '',
  avatar: null,
  isLoggedIn: false,
  loading: false,
  error: null,
})

// Restore session from localStorage on startup
const _saved = localStorage.getItem('tp_auth')
if (_saved) {
  try {
    const parsed = JSON.parse(_saved)
    Object.assign(_state, parsed, { isLoggedIn: true, loading: false, error: null })
  } catch { /* invalid stored data */ }
}

export const user = readonly(_state)
export const isLoggedIn = computed(() => _state.isLoggedIn)
export const authLoading = computed(() => _state.loading)
export const authError = computed(() => _state.error)

export async function login(email, password) {
  _state.loading = true
  _state.error = null
  try {
    // API_CALL: POST /api/auth/login { email, password }
    // const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }), headers: { 'Content-Type': 'application/json' } })
    // const data = await res.json()
    // if (!res.ok) throw new Error(data.detail || 'Login failed')

    // ── Mock ──
    await _mockDelay(0)
    const mockUser = {
      id: 1,
      name: email
        ? email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        : 'Demo User',
      email: email || 'demo@taskpilot.app',
      avatar: null,
    }
    Object.assign(_state, mockUser, { isLoggedIn: true })
    localStorage.setItem('tp_auth', JSON.stringify(mockUser))
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
    // API_CALL: POST /api/auth/register { name, email, password }
    await _mockDelay()
    if (!name || !email || !password) throw new Error('All fields are required')
    const mockUser = { id: Date.now(), name, email, avatar: null }
    Object.assign(_state, mockUser, { isLoggedIn: true })
    localStorage.setItem('tp_auth', JSON.stringify(mockUser))
  } catch (err) {
    _state.error = err.message
    throw err
  } finally {
    _state.loading = false
  }
}

export async function logout() {
  // API_CALL: POST /api/auth/logout
  Object.assign(_state, { id: null, name: '', email: '', avatar: null, isLoggedIn: false, error: null })
  localStorage.removeItem('tp_auth')
  localStorage.removeItem('tp_projects')
}

export function clearAuthError() {
  _state.error = null
}

function _mockDelay(ms = 400) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
