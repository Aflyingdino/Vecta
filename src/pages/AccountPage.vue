<script setup>
import { computed, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { user, updateSubscriptionPlan, authLoading } from '@/stores/authStore'
import { getPlanList, getPlanLabel, formatLimit, canUseRoles } from '@/utils/subscriptionPlans'
import { ui, setLanguage, setThemeMode } from '@/stores/uiStore'
import { t } from '@/utils/i18n'

const plans = getPlanList()
const localError = ref('')

const currentPlan = computed(() => plans.find((plan) => plan.key === user.subscriptionPlan) || plans[0])
const nextPlan = computed(() => plans.find((plan) => plan.key === user.subscriptionNextPlan) || null)

function formatDateTime(value) {
  if (!value) return t('noDate')
  const locale = ui.language === 'en' ? 'en-GB' : 'nl-NL'
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function planActionLabel(planKey) {
  if (planKey === user.subscriptionPlan) return t('currentPlan')
  if (!user.subscriptionExpiresAt || user.subscriptionPlan === 'free') return t('startNow')
  return t('scheduleAfterExpiry')
}

async function choosePlan(planKey) {
  localError.value = ''
  try {
    await updateSubscriptionPlan(planKey)
  } catch (error) {
    localError.value = error.message || 'Kon abonnement niet bijwerken.'
  }
}
</script>

<template>
  <AppLayout>
    <div class="account-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ t('account') }}</h1>
          <p class="page-sub">{{ t('accountSub') }}</p>
        </div>
      </div>

      <section class="account-card account-card--hero">
        <div class="account-avatar">{{ user.name?.[0]?.toUpperCase() || '?' }}</div>
        <div class="account-meta">
          <p class="account-name">{{ user.name }}</p>
          <p class="account-email">{{ user.email }}</p>
          <span class="account-badge">{{ getPlanLabel(user.subscriptionPlan) }}</span>
        </div>
      </section>

      <section class="account-card account-card--plan">
        <div class="plan-header">
          <div>
              <p class="section-kicker">{{ t('currentSubscription') }}</p>
            <h2>{{ currentPlan.name }}</h2>
            <p class="plan-price">{{ currentPlan.price }}</p>
          </div>
          <div class="plan-pill">{{ canUseRoles(user.subscriptionPlan) ? t('rolesOn') : t('noRoles') }}</div>
        </div>
        <div class="plan-status">
          <div>
            <p class="plan-status__label">Startdatum</p>
            <p class="plan-status__value">{{ formatDateTime(user.subscriptionStartedAt) }}</p>
          </div>
          <div>
            <p class="plan-status__label">Verloopt op</p>
            <p class="plan-status__value">{{ formatDateTime(user.subscriptionExpiresAt) }}</p>
          </div>
          <div v-if="nextPlan">
            <p class="plan-status__label">Volgend plan</p>
            <p class="plan-status__value">{{ nextPlan.name }} vanaf {{ formatDateTime(user.subscriptionNextStartsAt) }}</p>
          </div>
        </div>
        <div class="plan-limits">
          <div v-for="feature in currentPlan.features" :key="feature" class="plan-feature">{{ feature }}</div>
        </div>
        <p v-if="localError" class="account-error">{{ localError }}</p>
      </section>

        <section class="account-card account-card--settings">
          <div class="settings-header">
            <div>
              <p class="section-kicker">{{ t('settings') }}</p>
              <h2>{{ t('appearance') }}</h2>
            </div>
          </div>
          <div class="settings-grid">
            <div class="settings-group">
              <p class="settings-group-title">{{ t('appearance') }}</p>
              <div class="settings-options">
                <button class="option-btn" :class="{ 'option-btn--active': ui.lightMode }" @click="setThemeMode('light')" type="button">
                  {{ t('light') }}
                </button>
                <button class="option-btn" :class="{ 'option-btn--active': !ui.lightMode }" @click="setThemeMode('dark')" type="button">
                  {{ t('dark') }}
                </button>
              </div>
            </div>
            <div class="settings-group">
              <p class="settings-group-title">{{ t('language') }}</p>
              <div class="settings-options">
                <button class="option-btn" :class="{ 'option-btn--active': ui.language === 'nl' }" @click="setLanguage('nl')" type="button">
                  {{ t('dutch') }}
                </button>
                <button class="option-btn" :class="{ 'option-btn--active': ui.language === 'en' }" @click="setLanguage('en')" type="button">
                  {{ t('english') }}
                </button>
              </div>
            </div>
          </div>
        </section>

      <section class="plan-grid">
        <button
          v-for="plan in plans"
          :key="plan.key"
          class="plan-card"
          :class="{ 'plan-card--active': user.subscriptionPlan === plan.key }"
          :disabled="authLoading || user.subscriptionPlan === plan.key"
          @click="choosePlan(plan.key)"
        >
          <div class="plan-card__top">
            <div>
              <h3>{{ plan.name }}</h3>
              <p>{{ plan.subtitle }}</p>
            </div>
            <span class="plan-cost">{{ plan.priceShort }}</span>
          </div>
          <div class="plan-card__body">
            <div v-for="feature in plan.features" :key="feature" class="plan-card__feature">{{ feature }}</div>
          </div>
          <div class="plan-card__footer">
            <span>{{ planActionLabel(plan.key) }}</span>
            <span>{{ formatLimit(plan.limits.projects) }} projecten</span>
          </div>
        </button>
      </section>
    </div>
  </AppLayout>
</template>

<style scoped>
.account-page {
  flex: 1;
  overflow-y: auto;
  padding: 32px 40px 40px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.page-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; }
.page-title { font-size: 26px; font-weight: 800; color: var(--color-text-1); }
.page-sub { font-size: 13px; color: var(--color-text-3); margin-top: 4px; }
.account-card {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 20px;
}
.account-card--hero { display: flex; align-items: center; gap: 16px; }
.account-avatar {
  width: 54px; height: 54px; border-radius: 16px;
  background: var(--color-accent); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 800;
}
.account-meta { display: flex; flex-direction: column; gap: 4px; }
.account-name { font-size: 18px; font-weight: 800; color: var(--color-text-1); }
.account-email { font-size: 13px; color: var(--color-text-3); }
.account-badge, .plan-pill {
  display: inline-flex; align-items: center; width: fit-content;
  padding: 4px 10px; border-radius: 999px;
  background: color-mix(in srgb, var(--color-accent) 14%, transparent);
  color: var(--color-accent); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em;
}
.account-card--plan { display: flex; flex-direction: column; gap: 14px; }
.plan-header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
.section-kicker { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: var(--color-text-3); font-weight: 700; }
.plan-header h2 { font-size: 20px; color: var(--color-text-1); margin-top: 3px; }
.plan-price { font-size: 13px; color: var(--color-text-2); margin-top: 4px; }
.plan-limits { display: flex; flex-wrap: wrap; gap: 8px; }
.plan-status {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  background: var(--color-surface-1);
  border: 1px solid var(--color-border);
}
.plan-status__label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: var(--color-text-3); font-weight: 700; }
.plan-status__value { font-size: 13px; color: var(--color-text-1); margin-top: 4px; font-weight: 600; }
.plan-feature, .plan-card__feature {
  padding: 7px 10px; border-radius: 10px;
  background: var(--color-surface-1); border: 1px solid var(--color-border);
  font-size: 12px; color: var(--color-text-2);
}
.account-error { color: var(--color-danger); font-size: 13px; }
.plan-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px;
}
.plan-card {
  text-align: left;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: border-color .15s, transform .15s, box-shadow .15s;
}
.plan-card:hover { transform: translateY(-1px); border-color: var(--color-accent); box-shadow: 0 12px 30px rgba(0,0,0,.18); }
.plan-card--active { outline: 2px solid color-mix(in srgb, var(--color-accent) 45%, transparent); }
.plan-card:disabled { cursor: default; opacity: 0.9; }
.plan-card__top { display: flex; justify-content: space-between; gap: 10px; }
.plan-card__top h3 { font-size: 16px; color: var(--color-text-1); }
.plan-card__top p { font-size: 12px; color: var(--color-text-3); margin-top: 2px; }
.plan-cost { font-size: 12px; font-weight: 700; color: var(--color-accent); }
.plan-card__body { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
.plan-card__footer {
  display: flex; justify-content: space-between; gap: 12px; margin-top: 14px;
  font-size: 11px; color: var(--color-text-3); text-transform: uppercase; letter-spacing: .05em;
}
@media (max-width: 900px) {
  .account-page { padding: 24px; }
  .page-header, .plan-header { flex-direction: column; align-items: flex-start; }
}
</style>