<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register, authLoading, authError, clearAuthError } from '@/stores/authStore'
import { fetchProjects } from '@/stores/projectStore'
import { getPlanList, getPlanLabel, formatLimit } from '@/utils/subscriptionPlans'

const router = useRouter()
const plans = getPlanList()

const name = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')
const selectedPlan = ref('free')
const planPickerOpen = ref(false)
const localError = ref('')

<<<<<<< Updated upstream
=======
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

function openPlanPicker() {
  planPickerOpen.value = true
}

function closePlanPicker() {
  planPickerOpen.value = false
}

function choosePlan(planKey) {
  selectedPlan.value = planKey
  closePlanPicker()
}

>>>>>>> Stashed changes
async function handleRegister() {
  clearAuthError()
  localError.value = ''
  if (password.value !== confirm.value) {
    localError.value = 'Passwords do not match'
    return
  }
  try {
<<<<<<< Updated upstream
    await register({ name: name.value, email: email.value, password: password.value })
    await fetchProjects()
    router.push({ name: 'projects' })
  } catch (_) { /* error shown via authError */ }
=======
    await register({
      name: name.value.trim(),
      email: email.value.trim().toLowerCase(),
      password: password.value,
      subscriptionPlan: selectedPlan.value,
    })
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
      <h1 class="auth-title">Create account</h1>
      <p class="auth-sub">Free forever, no credit card needed</p>
=======
      <h1 class="auth-title">Account aanmaken</h1>
      <p class="auth-sub">Kies direct je abonnement of ga gratis verder, zonder creditcard</p>
>>>>>>> Stashed changes

      <div v-if="localError || authError" class="auth-error">{{ localError || authError }}</div>

      <form class="auth-form" @submit.prevent="handleRegister">
        <label class="form-label">
          Full name
          <input v-model="name" type="text" class="form-input" placeholder="Jane Smith" required autocomplete="name" />
        </label>
        <label class="form-label">
          Email
          <input v-model="email" type="email" class="form-input" placeholder="you@example.com" required autocomplete="email" />
        </label>

        <div class="plan-section">
          <div class="form-label plan-label">Abonnement</div>
          <button type="button" class="plan-picker-btn" @click="openPlanPicker">
            <div>
              <span class="plan-picker-btn__title">Kies een plan</span>
              <span class="plan-picker-btn__subtitle">Huidig: {{ getPlanLabel(selectedPlan) }}</span>
            </div>
            <span class="plan-picker-btn__chev">›</span>
          </button>
        </div>

        <label class="form-label">
          Password
          <input v-model="password" type="password" class="form-input" placeholder="Enter password" required autocomplete="new-password" />
        </label>
        <label class="form-label">
          Confirm password
          <input v-model="confirm" type="password" class="form-input" placeholder="Repeat password" required autocomplete="new-password" />
        </label>
        <button type="submit" class="btn-submit" :disabled="authLoading">
          <span v-if="authLoading" class="spinner"></span>
          {{ authLoading ? 'Creating account…' : 'Create account' }}
        </button>
      </form>

      <p class="auth-switch">
        Already have an account? <router-link to="/login">Log in</router-link>
      </p>

      <Teleport to="body">
        <div v-if="planPickerOpen" class="plan-modal-backdrop" @click.self="closePlanPicker">
          <div class="plan-modal" role="dialog" aria-modal="true" aria-labelledby="plan-picker-title">
            <div class="plan-modal__header">
              <div>
                <h2 id="plan-picker-title">Kies een plan</h2>
                <p>Kies nu een abonnement of laat het op Free staan.</p>
              </div>
              <button type="button" class="plan-modal__close" @click="closePlanPicker" aria-label="Sluiten">×</button>
            </div>

            <div class="plan-modal__grid">
              <button
                v-for="plan in plans"
                :key="plan.key"
                type="button"
                class="plan-choice"
                :class="{ 'plan-choice--active': selectedPlan === plan.key }"
                @click="choosePlan(plan.key)"
              >
                <span class="plan-choice__name">{{ getPlanLabel(plan.key) }}</span>
                <span class="plan-choice__price">{{ plan.priceShort }}</span>
                <span class="plan-choice__limit">{{ formatLimit(plan.limits.projects) }} projecten</span>
              </button>
            </div>

            <div class="plan-modal__actions">
              <button type="button" class="btn-secondary" @click="choosePlan('free')">Verder met Free</button>
              <button type="button" class="btn-secondary btn-secondary--ghost" @click="closePlanPicker">Sluiten</button>
            </div>
          </div>
        </div>
      </Teleport>
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
<<<<<<< Updated upstream
=======
.plan-section { display: flex; flex-direction: column; gap: 8px; }
.plan-label { margin-bottom: 2px; }
.plan-picker-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  color: var(--color-text-1);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, transform 0.15s;
}
.plan-picker-btn:hover { transform: translateY(-1px); border-color: color-mix(in srgb, var(--color-accent) 40%, var(--color-border)); }
.plan-picker-btn__title { display: block; font-size: 14px; font-weight: 700; }
.plan-picker-btn__subtitle { display: block; font-size: 12px; color: var(--color-text-3); margin-top: 2px; }
.plan-picker-btn__chev { font-size: 22px; line-height: 1; color: var(--color-text-3); }
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
>>>>>>> Stashed changes
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

.plan-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(12, 18, 28, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 50;
}
.plan-modal {
  width: min(760px, 100%);
  max-height: min(84vh, 760px);
  overflow: auto;
  border-radius: 18px;
  background: var(--color-surface-1);
  border: 1px solid var(--color-border);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.26);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.plan-modal__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
}
.plan-modal__header h2 {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-text-1);
}
.plan-modal__header p {
  font-size: 13px;
  color: var(--color-text-3);
  margin-top: 4px;
}
.plan-modal__close {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  color: var(--color-text-2);
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
}
.plan-modal__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.plan-choice {
  text-align: left;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  color: var(--color-text-1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: border-color 0.15s, background 0.15s, transform 0.15s;
}
.plan-choice:hover { transform: translateY(-1px); border-color: color-mix(in srgb, var(--color-accent) 40%, var(--color-border)); }
.plan-choice--active {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 10%, var(--color-surface-2));
}
.plan-choice__name { font-size: 14px; font-weight: 700; }
.plan-choice__price { font-size: 12px; color: var(--color-text-2); }
.plan-choice__limit { font-size: 11px; color: var(--color-text-3); }
.plan-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.btn-secondary {
  border: 1px solid var(--color-border);
  background: var(--color-accent);
  color: #fff;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
}
.btn-secondary:hover { background: var(--color-accent-hover); }
.btn-secondary--ghost {
  background: var(--color-surface-2);
  color: var(--color-text-1);
}
.btn-secondary--ghost:hover { background: var(--color-surface-3); }

@media (max-width: 640px) {
  .plan-modal__grid { grid-template-columns: 1fr; }
  .plan-modal__actions { flex-direction: column; }
  .btn-secondary { width: 100%; }
}
</style>
