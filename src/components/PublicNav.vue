<script setup>
import { isLoggedIn } from '@/stores/authStore'
import { t } from '@/stores/i18nStore'
import GlobalControls from '@/components/GlobalControls.vue'
</script>

<template>
  <header class="pub-nav">
    <div class="pub-left">
      <router-link to="/" class="pub-brand">
        <img src="/logo.png" alt="TaskPilot logo" width="26" height="26" />
        <span>TaskPilot</span>
      </router-link>
      <GlobalControls />
    </div>

    <nav class="pub-links">
      <router-link to="/" exact-active-class="pub-link--active" class="pub-link">{{ t('navHome') }}</router-link>
      <router-link to="/about" active-class="pub-link--active" class="pub-link">{{ t('navAbout') }}</router-link>
      <router-link to="/contact" active-class="pub-link--active" class="pub-link">{{ t('navContact') }}</router-link>

      <template v-if="!isLoggedIn">
        <router-link to="/login" class="pub-btn pub-btn--ghost">{{ t('navLogin') }}</router-link>
        <router-link to="/register" class="pub-btn pub-btn--primary">{{ t('navGetStarted') }}</router-link>
      </template>
      <template v-else>
        <router-link to="/projects" class="pub-btn pub-btn--primary">{{ t('navOpenApp') }}</router-link>
      </template>
    </nav>
  </header>
</template>

<style scoped>
.pub-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 48px;
  height: 60px;
  border-bottom: 1px solid var(--color-border-sub);
  position: sticky;
  top: 0;
  background: var(--color-surface-0);
  z-index: 10;
  flex-shrink: 0;
}

:global(html.light-mode) .pub-nav {
  background: #ffffff !important;
  border-bottom-color: #e2e8f0 !important;
}

.pub-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pub-brand {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-1);
  text-decoration: none;
  letter-spacing: -0.02em;
}

:global(html.light-mode) .pub-brand {
  color: #0f172a !important;
}

.pub-links {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pub-link {
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-2);
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
}
.pub-link:hover {
  color: var(--color-text-1);
  background: var(--color-surface-2);
}
.pub-link--active {
  color: var(--color-text-1);
  background: var(--color-surface-2);
}

:global(html.light-mode) .pub-link {
  color: #475569 !important;
}

:global(html.light-mode) .pub-link:hover,
:global(html.light-mode) .pub-link--active {
  color: #0f172a !important;
  background: #f1f5f9 !important;
}

.pub-btn {
  padding: 6px 14px;
  border-radius: 7px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  margin-left: 4px;
}
.pub-btn--ghost {
  color: var(--color-text-1);
  border: 1px solid var(--color-border);
  background: transparent;
}
.pub-btn--ghost:hover {
  background: var(--color-surface-2);
}
.pub-btn--primary {
  background: var(--color-accent);
  color: #fff;
  border: 1px solid transparent;
}
.pub-btn--primary:hover {
  background: var(--color-accent-hover, #4e4ec2);
}

:global(html.light-mode) .pub-btn--ghost {
  color: #0f172a !important;
  border-color: #cbd5e1 !important;
  background: transparent !important;
}

:global(html.light-mode) .pub-btn--ghost:hover {
  background: #f1f5f9 !important;
}

:global(html.light-mode) .pub-btn--primary {
  background: #3b82f6 !important;
  color: #ffffff !important;
}

:global(html.light-mode) .pub-btn--primary:hover {
  background: #2563eb !important;
}

@media (max-width: 900px) {
  .pub-nav {
    padding: 0 14px;
    height: auto;
    min-height: 60px;
    gap: 10px;
    flex-wrap: wrap;
  }
  .pub-links {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }
}
</style>
