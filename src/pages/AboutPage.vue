<script setup>
import PublicNav from '@/components/PublicNav.vue'
</script>

<template>
  <div class="public-page">
    <PublicNav />

    <main class="about-content">
      <h1>About TaskPilot</h1>
      <p class="lead">TaskPilot is a collaborative project management tool built to help teams plan, track, and ship work efficiently.</p>

      <section class="about-section">
        <h2>What is TaskPilot?</h2>
        <p>TaskPilot gives teams a powerful kanban-based workspace with deadlines, labels, priorities, and comments — all in a clean, dark interface. Projects can be shared with stakeholders via public read-only links.</p>
      </section>

      <section class="about-section">
        <h2>Roles & Permissions</h2>
        <div class="role-grid">
          <div class="role-card">
            <h3>Owner</h3>
            <p>Full control — manage team members, settings, and can delete the project.</p>
          </div>
          <div class="role-card">
            <h3>Admin</h3>
            <p>Manage members and settings, but cannot delete the project.</p>
          </div>
          <div class="role-card">
            <h3>User</h3>
            <p>Create and manage tasks within their assigned permissions.</p>
          </div>
        </div>
      </section>

      <section class="about-section">
        <h2>Public access</h2>
        <p>Visitors who are not logged in can access the Homepage, About, Contact pages, and any project shared via a public link (read-only).</p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.public-page { min-height: 100vh; background: var(--color-surface-0); color: var(--color-text-1); }
.pub-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 48px;
  height: 60px;
  border-bottom: 1px solid var(--color-border-sub);
  background: var(--color-surface-0);
  position: sticky;
  top: 0;
  z-index: 10;
}
.pub-brand { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 700; }
.pub-links { display: flex; align-items: center; gap: 16px; }
.pub-links a { font-size: 13px; color: var(--color-text-2); text-decoration: none; }
.pub-links a:hover { color: var(--color-text-1); }
.btn-accent {
  padding: 7px 16px;
  border-radius: 7px;
  background: var(--color-accent) !important;
  color: #fff !important;
  font-weight: 600;
}
.about-content {
  max-width: 720px;
  margin: 0 auto;
  padding: 64px 32px;
}
.about-content h1 { font-size: 36px; font-weight: 800; margin-bottom: 16px; }
.lead { font-size: 17px; color: var(--color-text-2); margin-bottom: 48px; line-height: 1.7; }
.about-section { margin-bottom: 48px; }
.about-section h2 { font-size: 22px; font-weight: 700; margin-bottom: 14px; }
.about-section p { font-size: 14px; color: var(--color-text-2); line-height: 1.8; }
.role-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); gap: 16px; margin-top: 16px; }
.role-card {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 20px;
}
.role-card h3 { font-size: 15px; font-weight: 700; margin-bottom: 8px; color: var(--color-accent); }
.role-card p { font-size: 13px; color: var(--color-text-2); line-height: 1.6; }
</style>
