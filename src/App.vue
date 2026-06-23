<script setup>
import { useRoute } from 'vue-router'
import { onMounted, onUnmounted, watch } from 'vue'
import { applyTheme } from '@/stores/uiStore'
import { isLoggedIn } from '@/stores/authStore'
import { refreshProjects } from '@/stores/projectStore'
import { refreshInvitations } from '@/stores/invitationStore'

const route = useRoute()

const SYNC_INTERVAL_MS = 10000
let syncTimer = null

async function syncProjects() {
  if (!isLoggedIn.value) return
  await Promise.all([
    refreshProjects(),
    refreshInvitations(),
  ])
}

function startSync() {
  stopSync()
  syncProjects()
  syncTimer = window.setInterval(syncProjects, SYNC_INTERVAL_MS)
  window.addEventListener('focus', syncProjects)
  document.addEventListener('visibilitychange', syncProjects)
}

function stopSync() {
  if (syncTimer !== null) {
    window.clearInterval(syncTimer)
    syncTimer = null
  }
  window.removeEventListener('focus', syncProjects)
  document.removeEventListener('visibilitychange', syncProjects)
}

onMounted(() => {
  applyTheme()
})

watch(isLoggedIn, (loggedIn) => {
  if (loggedIn) {
    startSync()
  } else {
    stopSync()
  }
}, { immediate: true })

onUnmounted(() => {
  stopSync()
})
</script>

<template>
  <RouterView v-slot="{ Component, route: r }">
    <Transition name="page" mode="out-in">
      <component :is="Component" :key="r.fullPath" />
    </Transition>
  </RouterView>
</template>

<style>
.page-enter-active {
  transition: opacity 0.2s ease, transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}
.page-leave-active {
  transition: opacity 0.15s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
}
</style>
