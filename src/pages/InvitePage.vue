<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PublicNav from '@/components/PublicNav.vue'
import { fetchInvitationByToken, acceptInvitationByToken } from '@/stores/invitationStore'
import { setActiveProject } from '@/stores/projectStore'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const accepting = ref(false)
const invitation = ref(null)
const error = ref('')

onMounted(async () => {
  try {
    invitation.value = await fetchInvitationByToken(route.params.token)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})

async function acceptInvite() {
  accepting.value = true
  error.value = ''
  try {
    const result = await acceptInvitationByToken(route.params.token)
    if (result?.projectId) {
      setActiveProject(result.projectId)
      await router.push({ name: 'board', params: { id: result.projectId } })
    } else {
      await router.push({ name: 'dashboard' })
    }
  } catch (err) {
    error.value = err.message
  } finally {
    accepting.value = false
  }
}
</script>

<template>
  <div class="invite-page">
    <PublicNav />
    <main class="invite-shell">
      <section class="invite-panel">
        <p class="invite-eyebrow">Project invitation</p>
        <h1 v-if="invitation">Join {{ invitation.projectName }}</h1>
        <h1 v-else>Invitation</h1>

        <p v-if="loading" class="invite-copy">Loading invitation...</p>
        <template v-else-if="invitation">
          <p class="invite-copy">
            {{ invitation.invitedBy }} invited you as {{ invitation.role }}.
          </p>
          <div class="invite-meta">
            <span>{{ invitation.email }}</span>
            <span v-if="invitation.expiresAt">Expires {{ new Date(invitation.expiresAt).toLocaleDateString('nl-NL') }}</span>
          </div>
          <button class="invite-primary" :disabled="accepting" @click="acceptInvite">
            {{ accepting ? 'Joining...' : 'Accept invitation' }}
          </button>
        </template>
        <p v-if="error" class="invite-error">{{ error }}</p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.invite-page {
  min-height: 100vh;
  background: var(--color-surface-0);
  color: var(--color-text-1);
}
.invite-shell {
  min-height: calc(100vh - 72px);
  display: grid;
  place-items: center;
  padding: 32px 20px;
}
.invite-panel {
  width: min(100%, 460px);
  border: 1px solid var(--color-border);
  background: var(--color-surface-1);
  border-radius: 12px;
  padding: 28px;
}
.invite-eyebrow {
  color: var(--color-accent);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 10px;
}
h1 {
  font-size: 28px;
  line-height: 1.15;
  margin-bottom: 12px;
}
.invite-copy {
  color: var(--color-text-2);
  line-height: 1.6;
}
.invite-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 18px 0;
  color: var(--color-text-3);
  font-size: 13px;
}
.invite-primary {
  width: 100%;
  height: 40px;
  border: 0;
  border-radius: 8px;
  background: var(--color-accent);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}
.invite-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.invite-error {
  margin-top: 14px;
  color: var(--color-danger);
  font-size: 13px;
}
</style>
