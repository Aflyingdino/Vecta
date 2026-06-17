import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { api } from './utils/api'
import { checkSession } from './stores/authStore'
import { fetchProjects } from './stores/projectStore'

async function bootstrap() {
  try {
    await api.initSecurity().catch(() => {})
    const loggedIn = await checkSession()
    if (loggedIn) await fetchProjects()
  } catch (error) {
    console.error('Bootstrap error:', error)
  }

  const app = createApp(App)
  app.use(router)
  app.mount('#app')
}

bootstrap()
