<script setup>
import { computed } from 'vue'
import PublicNav from '@/components/PublicNav.vue'
import { preferences } from '@/stores/preferencesStore'

const copy = computed(() => {
  if (preferences.language === 'en') {
    return {
      label: 'Contact',
      title: 'Get in touch',
      lead: 'Questions or feedback? Reach out directly.',
      team: 'Team',
      role: 'Developer',
      email: 'Email',
      portfolio: 'Portfolio',
      portfolioLink: 'View our portfolio',
    }
  }

  return {
    label: 'Contact',
    title: 'Neem contact op',
    lead: 'Vragen of feedback? Neem direct contact op.',
    team: 'Team',
    role: 'Developer',
    email: 'E-mail',
    portfolio: 'Portfolio',
    portfolioLink: 'Bekijk ons portfolio',
  }
})

const creators = [
  { name: 'Kenji Bras', initials: 'KB' },
  { name: 'Casper Gutteling', initials: 'CG' },
  { name: 'Justin van Dam', initials: 'JD' },
]
</script>

<template>
  <div class="public-page">
    <PublicNav />

    <main class="contact-content">

      <header class="contact-header">
        <div class="contact-label">{{ copy.label }}</div>
        <h1>{{ copy.title }}</h1>
        <p class="lead">{{ copy.lead }}</p>
      </header>

      <section class="section">
        <h2 class="section-title">{{ copy.team }}</h2>
        <div class="creator-grid">
          <div class="creator-card" v-for="c in creators" :key="c.name">
            <div class="creator-initials">{{ c.initials }}</div>
            <div>
              <div class="creator-name">{{ c.name }}</div>
              <div class="creator-role">{{ copy.role }}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">{{ copy.email }}</h2>
        <a href="mailto:hello@vecta.dev" class="contact-email">hello@vecta.dev</a>
      </section>

      <section class="section">
        <h2 class="section-title">{{ copy.portfolio }}</h2>
        <a href="#" class="portfolio-link">{{ copy.portfolioLink }}</a>
      </section>

    </main>
  </div>
</template>

<style scoped>
.public-page { min-height: 100vh; background: var(--color-surface-0); color: var(--color-text-1); }

.contact-content {
  max-width: 520px;
  margin: 0 auto;
  padding: 64px 32px 88px;
}

.contact-header {
  margin-bottom: 56px;
  padding-bottom: 44px;
  border-bottom: 1px solid var(--color-border-sub);
}
.contact-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 12px;
}
.contact-header h1 {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 10px;
}
.lead {
  font-size: 15px;
  color: var(--color-text-2);
  line-height: 1.7;
}

.section {
  margin-bottom: 40px;
}
.section-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-3);
  margin-bottom: 14px;
}

.creator-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.creator-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--color-surface-1);
  border: 1px solid var(--color-border);
  border-radius: 10px;
}
.creator-initials {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--color-surface-3);
  border: 1px solid var(--color-border);
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.03em;
}
.creator-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-1);
}
.creator-role {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 2px;
}

.contact-email {
  font-size: 14px;
  color: var(--color-accent);
  text-decoration: none;
  font-weight: 500;
}
.contact-email:hover { text-decoration: underline; }

.portfolio-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-1);
  text-decoration: none;
  padding: 9px 16px;
  border: 1px solid var(--color-border);
  border-radius: 7px;
  transition: background 0.15s;
}
.portfolio-link:hover { background: var(--color-surface-2); }
</style>
