import { reactive, computed } from 'vue'
import { api } from '@/utils/api'
import { refreshProjects } from '@/stores/projectStore'

const _state = reactive({
  invitations: [],
  loading: false,
  error: null,
})

export const invitations = computed(() => _state.invitations)
export const pendingInvitations = computed(() => _state.invitations.filter((item) => item.status === 'pending'))
export const invitationLoading = computed(() => _state.loading)
export const invitationError = computed(() => _state.error)

function removeInvitation(invitationId) {
  const idx = _state.invitations.findIndex((item) => item.id === invitationId)
  if (idx !== -1) {
    _state.invitations.splice(idx, 1)
  }
}

export async function fetchInvitations() {
  _state.loading = true
  try {
    const data = await api.get('/invitations')
    _state.invitations = data
    _state.error = null
  } catch (err) {
    _state.error = err.message
  } finally {
    _state.loading = false
  }
}

export async function refreshInvitations() {
  try {
    const data = await api.get('/invitations')
    _state.invitations = data
  } catch (err) {
    if (err.status === 401) throw err
    console.warn('Invitation sync failed:', err)
  }
}

export async function acceptInvitation(invitationId) {
  _state.loading = true
  _state.error = null
  try {
    const data = await api.post(`/invitations/${invitationId}/accept`)
    removeInvitation(invitationId)
    await refreshProjects()
    return data
  } catch (err) {
    _state.error = err.message
    throw err
  } finally {
    _state.loading = false
  }
}

export async function declineInvitation(invitationId) {
  _state.loading = true
  _state.error = null
  try {
    const data = await api.post(`/invitations/${invitationId}/decline`)
    removeInvitation(invitationId)
    return data
  } catch (err) {
    _state.error = err.message
    throw err
  } finally {
    _state.loading = false
  }
}

export async function fetchInvitationByToken(token) {
  return api.get(`/invitations/token/${encodeURIComponent(token)}`)
}

export async function acceptInvitationByToken(token) {
  const data = await api.post(`/invitations/token/${encodeURIComponent(token)}/accept`)
  await refreshProjects()
  await refreshInvitations()
  return data
}

export async function revokeInvitation(invitationId) {
  await api.delete(`/invitations/${invitationId}`)
  removeInvitation(invitationId)
}
