<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'
import { login, authLoading, authError, clearAuthError } from '@/stores/authStore'
import { t } from '@/utils/i18n'
import { fetchProjects } from '@/stores/projectStore'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const localError = ref('')

function validateLoginForm() {
  const trimmedEmail = email.value.trim().toLowerCase()
  if (!trimmedEmail || !trimmedEmail.includes('@')) return t('invalidEmail')
  if (!password.value.trim()) return t('passwordRequired')
  return null
}

async function handleLogin() {
  clearAuthError()
  localError.value = ''

  const validationError = validateLoginForm()
  if (validationError) {
    localError.value = validationError
    return
  }

  try {
    await login(email.value.trim().toLowerCase(), password.value)
    try {
      await fetchProjects()
    } catch (err) {
      console.warn('Failed to fetch projects, continuing anyway:', err)
    }
    const redirect = route.query.redirect || '/dashboard'
    await router.push(redirect)
  } catch (err) {
    console.error('Login failed:', err)
    // authError is already set by login()
  }
}

</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <router-link to="/" class="auth-logo">
        <img src="/logo.png" alt="Vecta logo" width="28" height="28" />
        <span>Vecta</span>
      </router-link>
      <h1 class="auth-title">{{ t('welcomeBack') }}</h1>
      <p class="auth-sub">{{ t('loginToAccount') }}</p>

      <div v-if="localError || authError" class="auth-error">{{ localError || authError }}</div>

      <form class="auth-form" @submit.prevent="handleLogin">
        <label class="form-label">
          {{ t('email') }}
          <input v-model="email" type="email" class="form-input" :placeholder="t('emailPlaceholder')" autocomplete="email" />
        </label>
        <label class="form-label">
          {{ t('password') }}
          <input v-model="password" type="password" class="form-input" :placeholder="t('passwordPlaceholder')" autocomplete="current-password" />
        </label>
        <button type="submit" class="btn-submit" :disabled="authLoading">
          <span v-if="authLoading" class="spinner"></span>
          {{ authLoading ? t('logInBusy') : t('logIn') }}
        </button>
      </form>

      <p class="auth-switch">
        {{ t('registerPrompt') }} <router-link to="/register">{{ t('register') }}</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-0);
  padding: 24px;
}
.auth-card {
  width: 100%;
  max-width: 380px;
  background: var(--color-surface-1);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 36px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.auth-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--color-text-1);
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}
.auth-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-1);
}
.auth-sub { font-size: 13px; color: var(--color-text-2); margin-top: -10px; }
.auth-error {
  padding: 10px 14px;
  border-radius: 7px;
  background: var(--color-danger-bg);
  color: var(--color-danger);
  font-size: 13px;
  border: 1px solid color-mix(in srgb, var(--color-danger) 30%, transparent);
}
.auth-form { display: flex; flex-direction: column; gap: 14px; }
.form-label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.form-input {
  padding: 9px 12px;
  border-radius: 7px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  color: var(--color-text-1);
  font-size: 14px;
  transition: border-color 0.15s;
  outline: none;
}
.form-input:focus { border-color: var(--color-accent); }
.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 11px;
  border: none;
  border-radius: 8px;
  background: var(--color-accent);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  margin-top: 4px;
}
.btn-submit:hover { background: var(--color-accent-hover); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 11px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface-2);
  color: var(--color-text-1);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.btn-demo:hover {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 10%, var(--color-surface-2));
}
.btn-demo:disabled { opacity: 0.6; cursor: not-allowed; }
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
.spinner--dark { border-color: color-mix(in srgb, var(--color-text-1) 25%, transparent); border-top-color: var(--color-text-1); }
@keyframes spin { to { transform: rotate(360deg); } }
.auth-demo-note { font-size: 12px; color: var(--color-text-3); text-align: center; line-height: 1.4; margin-top: -2px; }
.auth-switch { font-size: 13px; color: var(--color-text-2); text-align: center; }
.auth-switch a { color: var(--color-accent); text-decoration: none; font-weight: 600; }
.auth-switch a:hover { text-decoration: underline; }
</style>
