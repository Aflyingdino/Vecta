<script setup>
import PublicNav from '@/components/PublicNav.vue'

const logos = ['NovaOps', 'Aster Studio', 'Northline', 'Peak Digital', 'Atlas Labs']

const features = [
  ['Project boards', 'Plan, assign and ship work from one focused board.'],
  ['Team permissions', 'Owner, admin, member and viewer access enforced in the API.'],
  ['Calendar planning', 'Turn deadlines and scheduled tasks into a shared planning view.'],
  ['Activity history', 'Every important project action lands in the activity feed.'],
  ['Invitation links', 'Invite by email or copy a secure expiring project invite link.'],
  ['In-app notifications', 'Keep assignment, invite and comment updates visible.'],
]

const faqs = [
  ['Can I invite external collaborators?', 'Yes. Invite by email and share a secure invitation link that expires automatically.'],
  ['Are viewer roles read-only?', 'Yes. Viewers can inspect project work but write actions are blocked in the backend.'],
  ['Does Vecta support teams?', 'Projects have members, roles, pending invitations and activity tracking.'],
]
</script>

<template>
  <div class="home">
    <PublicNav />

    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Modern project operations</p>
        <h1>Run every project from one calm, collaborative workspace.</h1>
        <p class="hero-text">
          Vecta brings boards, calendars, task context, roles, invitations and team activity into a focused SaaS workspace built for real delivery.
        </p>
        <div class="hero-actions">
          <router-link to="/register" class="btn btn-primary">Start free</router-link>
          <router-link to="/login" class="btn btn-secondary">Open workspace</router-link>
        </div>
      </div>

      <div class="product-preview" aria-label="Vecta dashboard preview">
        <div class="preview-topbar">
          <span></span><span></span><span></span>
          <strong>Vecta Sprint Board</strong>
        </div>
        <div class="preview-body">
          <aside class="preview-sidebar">
            <b>Projects</b>
            <span class="active">Website Launch</span>
            <span>Mobile App</span>
            <span>Client Portal</span>
          </aside>
          <div class="preview-board">
            <div class="preview-col">
              <strong>Planned</strong>
              <article><b>Invite design partner</b><small>Admin review</small></article>
              <article><b>Create pricing page</b><small>Due Friday</small></article>
            </div>
            <div class="preview-col">
              <strong>In progress</strong>
              <article><b>Calendar QA</b><small>Assigned to Eva</small></article>
              <article><b>API permissions</b><small>High priority</small></article>
            </div>
            <div class="preview-col">
              <strong>Done</strong>
              <article><b>Invitation links</b><small>Shipped</small></article>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="trusted">
      <span>Trusted by focused product teams</span>
      <div>
        <strong v-for="logo in logos" :key="logo">{{ logo }}</strong>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <p class="eyebrow">Platform</p>
        <h2>Everything connected to the work graph.</h2>
      </div>
      <div class="feature-grid">
        <article v-for="[title, body] in features" :key="title" class="feature-card">
          <h3>{{ title }}</h3>
          <p>{{ body }}</p>
        </article>
      </div>
    </section>

    <section class="showcase">
      <div>
        <p class="eyebrow">Collaboration</p>
        <h2>Invite, manage and protect project access.</h2>
        <p>Send email invitations, copy expiring invite links, revoke pending invites, remove members and keep viewers read-only.</p>
      </div>
      <div class="access-table">
        <span>Owner</span><b>Full control</b>
        <span>Admin</span><b>Board and member management</b>
        <span>Member</span><b>Task and comment contribution</b>
        <span>Viewer</span><b>Read-only workspace access</b>
      </div>
    </section>

    <section class="showcase showcase-alt">
      <div class="metric-row">
        <article><b>24h</b><span>deadline focus</span></article>
        <article><b>100</b><span>recent activities</span></article>
        <article><b>14d</b><span>invite expiry</span></article>
      </div>
      <div>
        <p class="eyebrow">Dashboard</p>
        <h2>Know what needs attention before the team asks.</h2>
        <p>Recent tasks, overdue work, invitations, activity and planning signals live together in the dashboard.</p>
      </div>
    </section>

    <section class="pricing">
      <div>
        <p class="eyebrow">Pricing preview</p>
        <h2>Start lean, scale when roles and planning matter.</h2>
      </div>
      <div class="pricing-grid">
        <article><h3>Free</h3><p>One project for small teams validating their workflow.</p></article>
        <article><h3>Premium+</h3><p>Role-based collaboration, larger boards and team controls.</p></article>
        <article><h3>Enterprise</h3><p>Unlimited workspace capacity for serious delivery teams.</p></article>
      </div>
    </section>

    <section class="testimonials">
      <blockquote>
        "Vecta feels like the project room we wanted: quiet, fast and connected enough for the whole team."
      </blockquote>
      <span>Product lead, Atlas Labs</span>
    </section>

    <section class="faq">
      <div class="section-head">
        <p class="eyebrow">FAQ</p>
        <h2>Built for real collaboration.</h2>
      </div>
      <details v-for="[question, answer] in faqs" :key="question">
        <summary>{{ question }}</summary>
        <p>{{ answer }}</p>
      </details>
    </section>

    <section class="final-cta">
      <h2>Bring the team into one workspace.</h2>
      <router-link to="/register" class="btn btn-primary">Create your workspace</router-link>
    </section>

    <footer class="footer">
      <b>Vecta</b>
      <nav>
        <router-link to="/about">About</router-link>
        <router-link to="/contact">Contact</router-link>
        <router-link to="/login">Login</router-link>
      </nav>
    </footer>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  background: var(--color-surface-0);
  color: var(--color-text-1);
}
.hero {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(420px, 1.1fr);
  gap: 48px;
  align-items: center;
  min-height: 760px;
  padding: 72px clamp(20px, 5vw, 72px) 56px;
  background: var(--color-surface-0);
  border-bottom: 1px solid var(--color-border-sub);
}
.hero-copy {
  max-width: 640px;
}
.eyebrow {
  margin-bottom: 14px;
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
h1, h2, h3, p {
  margin: 0;
}
h1 {
  font-size: clamp(42px, 6vw, 76px);
  line-height: 1.02;
  letter-spacing: 0;
}
.hero-text {
  max-width: 560px;
  margin-top: 22px;
  color: var(--color-text-2);
  font-size: 18px;
  line-height: 1.7;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
}
.btn-primary {
  background: var(--color-accent);
  color: #fff;
}
.btn-secondary {
  color: var(--color-text-1);
  border: 1px solid var(--color-border);
  background: var(--color-surface-1);
}
.product-preview {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface-2);
  box-shadow: 0 22px 60px rgba(0,0,0,0.24);
}
.preview-topbar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 14px;
  background: var(--color-surface-1);
  border-bottom: 1px solid var(--color-border-sub);
  color: var(--color-text-3);
}
.preview-topbar span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--color-text-3);
}
.preview-topbar strong {
  margin-left: 10px;
  font-size: 12px;
}
.preview-body {
  display: grid;
  grid-template-columns: 170px 1fr;
  min-height: 420px;
}
.preview-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border-right: 1px solid var(--color-border-sub);
  color: var(--color-text-2);
  font-size: 13px;
}
.preview-sidebar b {
  color: var(--color-text-1);
  margin-bottom: 8px;
}
.preview-sidebar span {
  padding: 8px 10px;
  border-radius: 7px;
}
.preview-sidebar .active {
  color: var(--color-text-1);
  background: var(--color-surface-3);
}
.preview-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(160px, 1fr));
  gap: 12px;
  padding: 18px;
}
.preview-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.preview-col > strong {
  color: var(--color-text-3);
  font-size: 12px;
  text-transform: uppercase;
}
.preview-col article {
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface-3);
}
.preview-col b,
.preview-col small {
  display: block;
}
.preview-col b {
  font-size: 13px;
  margin-bottom: 8px;
}
.preview-col small {
  color: var(--color-text-3);
}
.trusted,
.section,
.showcase,
.pricing,
.testimonials,
.faq,
.final-cta,
.footer {
  padding: 64px clamp(20px, 5vw, 72px);
  border-bottom: 1px solid var(--color-border-sub);
}
.trusted {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  color: var(--color-text-2);
}
.trusted div {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}
.trusted strong {
  color: var(--color-text-1);
  font-size: 13px;
}
.section-head {
  max-width: 720px;
  margin-bottom: 28px;
}
h2 {
  font-size: clamp(30px, 4vw, 48px);
  line-height: 1.08;
  letter-spacing: 0;
}
.feature-grid,
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.feature-card,
.pricing-grid article {
  min-height: 160px;
  padding: 22px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface-2);
}
.feature-card h3,
.pricing-grid h3 {
  margin-bottom: 10px;
  font-size: 16px;
}
.feature-card p,
.showcase p,
.pricing-grid p,
.faq p {
  color: var(--color-text-2);
  line-height: 1.65;
}
.showcase {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(360px, 1fr);
  gap: 36px;
  align-items: center;
}
.showcase-alt {
  grid-template-columns: minmax(360px, 1fr) minmax(0, 0.9fr);
}
.access-table {
  display: grid;
  grid-template-columns: 120px 1fr;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}
.access-table span,
.access-table b {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border-sub);
}
.access-table span {
  color: var(--color-accent);
  background: var(--color-surface-1);
}
.access-table b {
  font-size: 14px;
}
.metric-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.metric-row article {
  padding: 24px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface-2);
}
.metric-row b {
  display: block;
  font-size: 34px;
}
.metric-row span {
  color: var(--color-text-3);
  font-size: 13px;
}
.testimonials {
  background: var(--color-surface-1);
  color: var(--color-text-1);
}
blockquote {
  max-width: 820px;
  margin: 0 0 16px;
  font-size: clamp(26px, 4vw, 44px);
  line-height: 1.18;
}
.testimonials span {
  color: var(--color-text-2);
}
.faq details {
  max-width: 900px;
  padding: 18px 0;
  border-bottom: 1px solid var(--color-border-sub);
}
.faq summary {
  cursor: pointer;
  font-weight: 800;
}
.faq p {
  margin-top: 10px;
}
.final-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.footer {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  color: var(--color-text-2);
}
.footer nav {
  display: flex;
  gap: 16px;
}
.footer a {
  color: var(--color-text-1);
  text-decoration: none;
}
@media (max-width: 980px) {
  .hero,
  .showcase,
  .showcase-alt {
    grid-template-columns: 1fr;
  }
  .preview-body {
    grid-template-columns: 1fr;
  }
  .preview-sidebar {
    display: none;
  }
  .feature-grid,
  .pricing-grid,
  .metric-row {
    grid-template-columns: 1fr;
  }
  .trusted,
  .final-cta,
  .footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
@media (max-width: 640px) {
  .hero {
    min-height: auto;
    padding-top: 48px;
  }
  .product-preview {
    border-radius: 10px;
  }
  .preview-board {
    grid-template-columns: 1fr;
  }
  .access-table {
    grid-template-columns: 1fr;
  }
}
</style>
