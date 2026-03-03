<script setup>
import { useRouter } from 'vue-router'
import { isLoggedIn } from '@/stores/authStore'
import PublicNav from '@/components/PublicNav.vue'

const router = useRouter()

const features = [
  {
    title: 'Kanban Boards',
    desc: 'Organize tasks into groups, drag & drop between columns.',
    svg: `<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="5" height="14" rx="1.5"/><rect x="10" y="3" width="5" height="10" rx="1.5"/><rect x="17" y="3" width="5" height="17" rx="1.5"/></svg>`,
  },
  {
    title: 'Labels & Priorities',
    desc: 'Tag tasks with custom color labels and priority levels.',
    svg: `<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z"/></svg>`,
  },
  {
    title: 'Deadlines & Calendar',
    desc: 'Set deadlines and view all tasks in an interactive calendar.',
    svg: `<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="17" rx="2"/><path stroke-linecap="round" d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  },
  {
    title: 'Comments',
    desc: 'Discuss tasks with your team directly in the task detail view.',
    svg: `<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>`,
  },
  {
    title: 'Share Links',
    desc: 'Share read-only project boards with stakeholders via link.',
    svg: `<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>`,
  },
  {
    title: 'Team Roles',
    desc: 'Assign owner, admin, and user roles within each project.',
    svg: `<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
  },
]
</script>

<template>
  <div class="home">
    <PublicNav />

    <!-- Hero -->
    <section class="hero">
      <div class="hero__badge">✦ Project management, simplified</div>
      <h1 class="hero__title">Ship projects faster<br>with your team</h1>
      <p class="hero__subtitle">
        TaskPilot keeps your team in sync — kanban boards, deadlines, labels, and comments in one place.
      </p>
      <div class="hero__cta">
        <router-link to="/register" class="btn btn-primary btn-lg">Start for free</router-link>
        <router-link to="/about" class="btn btn-ghost btn-lg">Learn more →</router-link>
      </div>
    </section>

    <!-- Features -->
    <section class="features">
      <h2 class="features__title">Everything your team needs</h2>
      <div class="features__grid">
        <div class="feature-card" v-for="f in features" :key="f.title">
          <div class="feature-icon" v-html="f.svg"></div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="home-footer">
      <p>© 2026 TaskPilot · <router-link to="/about">About</router-link> · <router-link to="/contact">Contact</router-link></p>
    </footer>
  </div>
</template>



<style scoped>
.home {
  min-height: 100vh;
  background: var(--color-surface-0);
  color: var(--color-text-1);
  display: flex;
  flex-direction: column;
}

/* Nav */
.home-nav {
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
}
.home-nav__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-1);
}
.home-nav__links {
  display: flex;
  align-items: center;
  gap: 12px;
}
.home-nav__links a {
  font-size: 13px;
  color: var(--color-text-2);
  text-decoration: none;
  transition: color 0.15s;
}
.home-nav__links a:hover { color: var(--color-text-1); }

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s;
}
.btn-primary {
  background: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);
}
.btn-primary:hover { background: var(--color-accent-hover); border-color: var(--color-accent-hover); }
.btn-ghost {
  background: transparent;
  color: var(--color-text-2);
  border-color: var(--color-border);
}
.btn-ghost:hover { background: var(--color-surface-2); color: var(--color-text-1); }
.btn-lg { padding: 11px 24px; font-size: 14px; border-radius: 9px; }

/* Hero */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 96px 48px 80px;
  gap: 24px;
}
.hero__badge {
  display: inline-block;
  padding: 5px 14px;
  border-radius: 99px;
  background: var(--color-accent-muted);
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 600;
  border: 1px solid color-mix(in srgb, var(--color-accent) 30%, transparent);
}
.hero__title {
  font-size: clamp(36px, 5vw, 64px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: var(--color-text-1);
  max-width: 700px;
}
.hero__subtitle {
  font-size: 18px;
  color: var(--color-text-2);
  max-width: 540px;
  line-height: 1.7;
}
.hero__cta {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

/* Features */
.features {
  padding: 64px 48px;
  background: var(--color-surface-1);
  border-top: 1px solid var(--color-border);
}
.features__title {
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 40px;
  color: var(--color-text-1);
}
.features__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  max-width: 960px;
  margin: 0 auto;
}
.feature-card {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.feature-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--color-accent-muted);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.feature-card h3 { font-size: 15px; font-weight: 700; color: var(--color-text-1); }
.feature-card p { font-size: 13px; color: var(--color-text-2); line-height: 1.6; }

/* Footer */
.home-footer {
  padding: 32px 48px;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-3);
  border-top: 1px solid var(--color-border-sub);
  margin-top: auto;
}
.home-footer a { color: var(--color-text-2); text-decoration: none; }
.home-footer a:hover { color: var(--color-text-1); }
</style>
