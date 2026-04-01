<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { register, authLoading, authError, clearAuthError } from '@/stores/authStore'
import { fetchProjects } from '@/stores/projectStore'
import { preferences } from '@/stores/preferencesStore'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')
const localError = ref('')

const copy = computed(() => {
  if (preferences.language === 'en') {
    return {
      title: 'Create account',
      subtitle: 'Free forever, no credit card needed',
      fullName: 'Full name',
      fullNamePlaceholder: 'Jane Smith',
      email: 'Email',
      emailPlaceholder: 'you@example.com',
      password: 'Password',
      passwordPlaceholder: 'Min. 6 characters',
      confirmPassword: 'Confirm password',
      confirmPlaceholder: 'Repeat password',
      loading: 'Creating account…',
      create: 'Create account',
      switchText: 'Already have an account?',
      switchCta: 'Log in',
      mismatch: 'Passwords do not match',
      minLength: 'Password must be at least 6 characters',
    }
  }

  return {
    title: 'Account aanmaken',
    subtitle: 'Gratis, zonder creditcard',
    fullName: 'Volledige naam',
    fullNamePlaceholder: 'Jan Jansen',
    email: 'E-mail',
    emailPlaceholder: 'jij@voorbeeld.nl',
    password: 'Wachtwoord',
    passwordPlaceholder: 'Min. 6 tekens',
    confirmPassword: 'Bevestig wachtwoord',
    confirmPlaceholder: 'Herhaal wachtwoord',
    loading: 'Account wordt aangemaakt…',
    create: 'Account aanmaken',
    switchText: 'Heb je al een account?',
    switchCta: 'Inloggen',
    mismatch: 'Wachtwoorden komen niet overeen',
    minLength: 'Wachtwoord moet minstens 6 tekens hebben',
  }
})

async function handleRegister() {
  clearAuthError()
  localError.value = ''
  if (password.value !== confirm.value) {
    localError.value = copy.value.mismatch
    return
  }
  if (password.value.length < 6) {
    localError.value = copy.value.minLength
    return
  }
  try {
    await register({ name: name.value, email: email.value, password: password.value })
    await fetchProjects()
    router.push({ name: 'projects' })
  } catch (_) { /* error shown via authError */ }
}

const displayError = () => localError.value || authError.value
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <router-link to="/" class="auth-logo">
        <img src="/logo.png" alt="TaskPilot logo" width="28" height="28" />
        <span>TaskPilot</span>
      </router-link>
      <h1 class="auth-title">{{ copy.title }}</h1>
      <p class="auth-sub">{{ copy.subtitle }}</p>

      <div v-if="localError || authError" class="auth-error">{{ localError || authError }}</div>

      <form class="auth-form" @submit.prevent="handleRegister">
        <label class="form-label">
          {{ copy.fullName }}
          <input v-model="name" type="text" class="form-input" :placeholder="copy.fullNamePlaceholder" required autocomplete="name" />
        </label>
        <label class="form-label">
          {{ copy.email }}
          <input v-model="email" type="email" class="form-input" :placeholder="copy.emailPlaceholder" required autocomplete="email" />
        </label>
        <label class="form-label">
          {{ copy.password }}
          <input v-model="password" type="password" class="form-input" :placeholder="copy.passwordPlaceholder" required autocomplete="new-password" />
        </label>
        <label class="form-label">
          {{ copy.confirmPassword }}
          <input v-model="confirm" type="password" class="form-input" :placeholder="copy.confirmPlaceholder" required autocomplete="new-password" />
        </label>
        <button type="submit" class="btn-submit" :disabled="authLoading">
          <span v-if="authLoading" class="spinner"></span>
          {{ authLoading ? copy.loading : copy.create }}
        </button>
      </form>

      <p class="auth-switch">
        {{ copy.switchText }} <router-link to="/login">{{ copy.switchCta }}</router-link>
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
.auth-title { font-size: 22px; font-weight: 700; color: var(--color-text-1); }
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
  outline: none;
  transition: border-color 0.15s;
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
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.auth-switch { font-size: 13px; color: var(--color-text-2); text-align: center; }
.auth-switch a { color: var(--color-accent); text-decoration: none; font-weight: 600; }
.auth-switch a:hover { text-decoration: underline; }
</style>
