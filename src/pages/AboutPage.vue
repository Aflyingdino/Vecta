<script setup>
import { computed } from 'vue'
import PublicNav from '@/components/PublicNav.vue'
import { preferences } from '@/stores/preferencesStore'

const copy = computed(() => {
  if (preferences.language === 'en') {
    return {
      label: 'About',
      lead: 'A project management tool built to help teams plan, track, and ship work without the overhead that makes most tools feel like more work than the work itself.',
      startedTitle: 'Where it started',
      startedBody: 'TaskPilot started as a school project with a clear constraint: build something that actually works the way a team works. Not a demo, not a mockup. The goal was a real tool you could hand to a team and have them use on day one without a manual. That constraint drove every decision: keep the interface clean, keep the features purposeful, and cut anything that does not pull its weight.',
      isTitle: 'What it is',
      isBody1: 'At its core, TaskPilot is a kanban-based workspace. You create a project, set up groups that match your workflow, and fill them with task cards. Each task can carry a label, a priority level, a deadline, and a running comment thread. When a task needs attention, the team gets notified inside the app.',
      isBody2: 'Projects have member roles so the right people have the right access. Any board can also be shared as a read-only public link, so stakeholders can follow along without needing an account. Tasks that are not ready for the board live in the backlog until they are.',
      inTitle: 'What is in it',
      rolesTitle: 'Roles and permissions',
      publicTitle: 'Public access',
      publicBody: 'No account is needed to view the homepage, about, or contact pages. Any project shared via a public link is also viewable without logging in, in read-only mode. Everything else requires an account.',
      goalTitle: 'The goal',
      goalBody: 'Ship a focused tool that teams can actually stick with. No feature creep, no dashboard bloat. Just the right tools, built well.',
      ownerBody: 'Full control. Can manage members, change settings, and delete the project.',
      adminBody: 'Can manage members and settings. Cannot delete the project.',
      userBody: 'Can create and manage tasks within the board.',
    }
  }

  return {
    label: 'Over',
    lead: 'Een projectmanagementtool die teams helpt plannen, opvolgen en opleveren zonder de ruis waardoor veel tools meer werk voelen dan het werk zelf.',
    startedTitle: 'Waar het begon',
    startedBody: 'TaskPilot begon als schoolproject met een duidelijke eis: iets bouwen dat echt werkt zoals teams werken. Geen demo, geen mockup. Het doel was een echte tool die je direct aan een team kunt geven zonder handleiding. Die eis stuurde elke keuze: houd de interface schoon, houd functies doelgericht en schrap alles wat geen waarde toevoegt.',
    isTitle: 'Wat het is',
    isBody1: 'In de kern is TaskPilot een kanban-workspace. Je maakt een project, zet groepen op die passen bij je workflow en vult die met taakkaarten. Elke taak kan labels, prioriteit, deadline en comments bevatten. Wanneer een taak aandacht nodig heeft, ziet het team dat direct in de app.',
    isBody2: 'Projecten hebben rollen zodat iedereen de juiste toegang heeft. Elk bord kan ook als read-only publieke link gedeeld worden, zodat stakeholders mee kunnen kijken zonder account. Taken die nog niet klaar zijn voor het bord blijven in de backlog.',
    inTitle: 'Wat erin zit',
    rolesTitle: 'Rollen en rechten',
    publicTitle: 'Publieke toegang',
    publicBody: 'Je hebt geen account nodig voor de home-, over- en contactpagina. Projecten met een publieke link zijn ook zonder inloggen zichtbaar in read-only modus. Voor de rest heb je een account nodig.',
    goalTitle: 'Het doel',
    goalBody: 'Een scherpe tool opleveren waar teams echt bij blijven. Geen feature creep, geen dashboard-bloat. Gewoon de juiste tools, goed gebouwd.',
    ownerBody: 'Volledige controle. Kan leden beheren, instellingen aanpassen en het project verwijderen.',
    adminBody: 'Kan leden en instellingen beheren. Kan het project niet verwijderen.',
    userBody: 'Kan taken aanmaken en beheren binnen het bord.',
  }
})

const featureList = computed(() => {
  if (preferences.language === 'en') {
    return [
      { label: 'Kanban boards', desc: 'Custom groups with drag-and-drop task cards.' },
      { label: 'Task labels', desc: 'Color-coded labels you define per project.' },
      { label: 'Priority levels', desc: 'Four levels: none, low, medium, and urgent.' },
      { label: 'Deadlines', desc: 'Set due dates on individual tasks.' },
      { label: 'Calendar view', desc: 'Monthly overview of all tasks that have a deadline.' },
      { label: 'Task comments', desc: 'Leave notes and updates directly on any task card.' },
      { label: 'Team roles', desc: 'Owner, Admin, and User with distinct permission scopes.' },
      { label: 'Public share links', desc: 'One link gives anyone read-only access to a board.' },
      { label: 'Backlog panel', desc: 'A dedicated space for tasks not yet placed on the board.' },
      { label: 'Notifications', desc: 'In-app alerts when tasks are updated or assigned.' },
    ]
  }

  return [
    { label: 'Kanban-borden', desc: 'Eigen groepen met drag-and-drop taakkaarten.' },
    { label: 'Taaklabels', desc: 'Kleurgecodeerde labels per project.' },
    { label: 'Prioriteitsniveaus', desc: 'Vier niveaus: geen, laag, medium en urgent.' },
    { label: 'Deadlines', desc: 'Stel vervaldatums in op individuele taken.' },
    { label: 'Kalenderweergave', desc: 'Maandoverzicht van alle taken met deadline.' },
    { label: 'Taakcomments', desc: 'Laat notities en updates direct op taken achter.' },
    { label: 'Teamrollen', desc: 'Owner, Admin en User met duidelijke rechten.' },
    { label: 'Publieke deellinks', desc: 'Eén link geeft iedereen read-only toegang tot een bord.' },
    { label: 'Backlogpaneel', desc: 'Een vaste plek voor taken die nog niet op het bord staan.' },
    { label: 'Notificaties', desc: 'In-app meldingen wanneer taken wijzigen of worden toegewezen.' },
  ]
})
</script>

<template>
  <div class="public-page">
    <PublicNav />

    <main class="about-content">

      <header class="about-header">
        <div class="about-label">{{ copy.label }}</div>
        <h1>TaskPilot</h1>
        <p class="lead">{{ copy.lead }}</p>
      </header>

      <section class="about-section">
        <h2>{{ copy.startedTitle }}</h2>
        <p>{{ copy.startedBody }}</p>
      </section>

      <section class="about-section">
        <h2>{{ copy.isTitle }}</h2>
        <p>{{ copy.isBody1 }}</p>
        <p class="para-spaced">{{ copy.isBody2 }}</p>
      </section>

      <section class="about-section">
        <h2>{{ copy.inTitle }}</h2>
        <div class="feature-list">
          <div class="feature-row" v-for="f in featureList" :key="f.label">
            <span class="feature-row__label">{{ f.label }}</span>
            <span class="feature-row__desc">{{ f.desc }}</span>
          </div>
        </div>
      </section>

      <section class="about-section">
        <h2>{{ copy.rolesTitle }}</h2>
        <div class="role-grid">
          <div class="role-card">
            <h3>Owner</h3>
            <p>{{ copy.ownerBody }}</p>
          </div>
          <div class="role-card">
            <h3>Admin</h3>
            <p>{{ copy.adminBody }}</p>
          </div>
          <div class="role-card">
            <h3>User</h3>
            <p>{{ copy.userBody }}</p>
          </div>
        </div>
      </section>

      <section class="about-section">
        <h2>{{ copy.publicTitle }}</h2>
        <p>{{ copy.publicBody }}</p>
      </section>

      <section class="about-section">
        <h2>{{ copy.goalTitle }}</h2>
        <p>{{ copy.goalBody }}</p>
      </section>

    </main>
  </div>
</template>

<style scoped>
.public-page { min-height: 100vh; background: var(--color-surface-0); color: var(--color-text-1); }

.about-content {
  max-width: 720px;
  margin: 0 auto;
  padding: 64px 32px 88px;
}

.about-header {
  margin-bottom: 60px;
  padding-bottom: 48px;
  border-bottom: 1px solid var(--color-border-sub);
}
.about-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 12px;
}
.about-header h1 {
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 16px;
}
.lead {
  font-size: 16px;
  color: var(--color-text-2);
  line-height: 1.8;
}

.about-section {
  margin-bottom: 52px;
}
.about-section h2 {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin-bottom: 14px;
  color: var(--color-text-1);
}
.about-section p {
  font-size: 14px;
  color: var(--color-text-2);
  line-height: 1.85;
}
.para-spaced { margin-top: 14px; }

.feature-list {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
}
.feature-row {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 11px 16px;
  border-bottom: 1px solid var(--color-border-sub);
  font-size: 13px;
}
.feature-row:last-child { border-bottom: none; }
.feature-row__label {
  font-weight: 600;
  color: var(--color-text-1);
  min-width: 160px;
  flex-shrink: 0;
}
.feature-row__desc {
  color: var(--color-text-2);
  line-height: 1.5;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}
.role-card {
  background: var(--color-surface-1);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 20px;
}
.role-card h3 {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-accent);
  margin-bottom: 8px;
}
.role-card p {
  font-size: 13px;
  color: var(--color-text-2);
  line-height: 1.6;
}
</style>
