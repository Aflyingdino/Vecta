<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { register, authLoading, authError, clearAuthError } from '@/stores/authStore'
import { fetchProjects } from '@/stores/projectStore'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')
const localError = ref('')

const passwordChecks = computed(() => ({
  minLength: password.value.length >= 10,
  hasLower: /[a-z]/.test(password.value),
  hasUpper: /[A-Z]/.test(password.value),
  hasNumber: /\d/.test(password.value),
}))

const passwordValid = computed(() => Object.values(passwordChecks.value).every(Boolean))

function validateRegisterForm() {
  const trimmedName = name.value.trim()
  const trimmedEmail = email.value.trim().toLowerCase()

  if (!trimmedName) return 'Naam is verplicht'
  if (!trimmedEmail || !trimmedEmail.includes('@')) return 'Voer een geldig e-mailadres in'
  if (!passwordValid.value) return 'Wachtwoord voldoet niet aan de eisen'
  if (password.value !== confirm.value) return 'Wachtwoorden komen niet overeen'
  return null
}

async function handleRegister() {
  clearAuthError()
  localError.value = ''

  const validationError = validateRegisterForm()
  if (validationError) {
    localError.value = validationError
    return
  }

  try {
    await register({ name: name.value.trim(), email: email.value.trim().toLowerCase(), password: password.value })
    try {
      await fetchProjects()
    } catch (err) {
      console.warn('Failed to fetch projects, continuing anyway:', err)
    }
    await router.push({ name: 'projects' })
  } catch (err) {
    console.error('Registration failed:', err)
    // authError is already set by register()
  }
}

const displayError = () => localError.value || authError.value
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <router-link to="/" class="auth-logo">
        <img src="/logo.png" alt="Vecta logo" width="28" height="28" />
        <span>Vecta</span>
      </router-link>
      <h1 class="auth-title">Account aanmaken</h1>
      <p class="auth-sub">Gratis te gebruiken, zonder creditcard</p>

      <div v-if="localError || authError" class="auth-error">{{ localError || authError }}</div>

      <form class="auth-form" @submit.prevent="handleRegister">
        <label class="form-label">
          Volledige naam
          <input v-model="name" type="text" class="form-input" placeholder="Jan Jansen" required autocomplete="name" />
        </label>
        <label class="form-label">
          E-mail
          <input v-model="email" type="email" class="form-input" placeholder="jij@voorbeeld.nl" required autocomplete="email" />
        </label>
        <label class="form-label">
          Wachtwoord
          <input v-model="password" type="password" class="form-input" placeholder="Vul een wachtwoord in" required autocomplete="new-password" minlength="10" />
        </label>
        <ul class="password-rules">
          <li :class="{ 'rule-ok': passwordChecks.minLength }">Minimaal 10 tekens</li>
          <li :class="{ 'rule-ok': passwordChecks.hasLower }">Minimaal 1 kleine letter</li>
          <li :class="{ 'rule-ok': passwordChecks.hasUpper }">Minimaal 1 hoofdletter</li>
          <li :class="{ 'rule-ok': passwordChecks.hasNumber }">Minimaal 1 cijfer</li>
        </ul>
        <label class="form-label">
          Herhaal wachtwoord
          <input v-model="confirm" type="password" class="form-input" placeholder="Herhaal wachtwoord" required autocomplete="new-password" />
        </label>
        <button type="submit" class="btn-submit" :disabled="authLoading || !passwordValid">
          <span v-if="authLoading" class="spinner"></span>
          {{ authLoading ? 'Account wordt aangemaakt…' : 'Account aanmaken' }}
        </button>
      </form>

      <p class="auth-switch">
        Heb je al een account? <router-link to="/login">Inloggen</router-link>
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
.password-rules {
  margin: -6px 0 2px;
  padding-left: 18px;
  color: var(--color-text-3);
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.rule-ok {
  color: #46a758;
}
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
