<script setup>
import PublicNav from '@/components/PublicNav.vue'

const featureList = [
  { label: 'Kanban-borden', desc: 'Aangepaste groepen met sleepbare taakkaarten.' },
  { label: 'Taaklabels', desc: 'Kleurgecodeerde labels die je per project bepaalt.' },
  { label: 'Prioriteiten', desc: 'Vier niveaus: geen, laag, gemiddeld en urgent.' },
  { label: 'Deadlines', desc: 'Stel einddatums in op losse taken.' },
  { label: 'Agendaview', desc: 'Maandoverzicht van alle taken met deadline.' },
  { label: 'Taakreacties', desc: 'Plaats notities en updates direct op taakkaarten.' },
  { label: 'Teamrollen', desc: 'Eigenaar, Admin en Lid met duidelijke rechten.' },
  { label: 'Openbare deellinks', desc: 'Met een link geef je alleen-lezen toegang tot een bord.' },
  { label: 'Backlog-paneel', desc: 'Een aparte plek voor taken die nog niet op het bord staan.' },
  { label: 'Meldingen', desc: 'In-app meldingen bij taakupdates of toewijzingen.' },
]
</script>

<template>
  <div class="public-page">
    <PublicNav />

    <main class="about-content">

      <header class="about-header">
        <div class="about-label">Over ons</div>
        <h1>Vecta</h1>
        <p class="lead">Een projecttool gebouwd om teams te helpen plannen, volgen en opleveren zonder onnodige complexiteit.</p>
      </header>

      <section class="about-section">
        <h2>Waar het begon</h2>
        <p>Vecta begon als een schoolproject met een duidelijke eis: bouw iets dat echt werkt zoals een team werkt. Geen demo, geen mockup. Het doel was een echte tool die een team meteen op dag één kan gebruiken zonder handleiding.</p>
      </section>

      <section class="about-section">
        <h2>Wat het is</h2>
        <p>In de kern is Vecta een kanban-werkruimte. Je maakt een project, zet groepen op die passen bij je workflow en vult die met taakkaarten. Elke taak kan een label, prioriteit, deadline en reactiereeks hebben.</p>
        <p class="para-spaced">Projecten hebben rollen, zodat de juiste mensen de juiste toegang hebben. Elk bord kan ook gedeeld worden met een openbare alleen-lezen link.</p>
      </section>

      <section class="about-section">
        <h2>Wat zit erin</h2>
        <div class="feature-list">
          <div class="feature-row" v-for="f in featureList" :key="f.label">
            <span class="feature-row__label">{{ f.label }}</span>
            <span class="feature-row__desc">{{ f.desc }}</span>
          </div>
        </div>
      </section>

      <section class="about-section">
        <h2>Rollen en rechten</h2>
        <div class="role-grid">
          <div class="role-card">
            <h3>Eigenaar</h3>
            <p>Volledige controle. Kan leden beheren, instellingen wijzigen en het project verwijderen.</p>
          </div>
          <div class="role-card">
            <h3>Admin</h3>
            <p>Kan leden en instellingen beheren. Kan het project niet verwijderen.</p>
          </div>
          <div class="role-card">
            <h3>Lid</h3>
            <p>Kan taken aanmaken en beheren binnen het bord.</p>
          </div>
        </div>
      </section>

      <section class="about-section">
        <h2>Publieke toegang</h2>
        <p>Voor de home-, over-ons- en contactpagina is geen account nodig. Een project met publieke link is ook zonder inloggen zichtbaar in alleen-lezen modus. Voor de rest is een account vereist.</p>
      </section>

      <section class="about-section">
        <h2>Het doel</h2>
        <p>Een gerichte tool die teams echt blijven gebruiken. Geen overbodige functies, geen rommelige dashboards. Gewoon de juiste tools, goed gebouwd.</p>
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
