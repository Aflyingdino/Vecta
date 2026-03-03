<script setup>
import { ref } from 'vue'
import PublicNav from '@/components/PublicNav.vue'

const name = ref('')
const email = ref('')
const message = ref('')
const sent = ref(false)

function handleSubmit() {
  // API_CALL: POST /api/contact { name, email, message }
  sent.value = true
}
</script>

<template>
  <div class="public-page">
    <PublicNav />

    <main class="contact-content">
      <h1>Contact us</h1>
      <p class="lead">Have a question or feedback? We'd love to hear from you.</p>

      <div v-if="sent" class="success-msg">
        ✓ Message sent! We'll get back to you soon.
      </div>

      <form v-else class="contact-form" @submit.prevent="handleSubmit">
        <label class="form-label">
          Name
          <input v-model="name" type="text" class="form-input" placeholder="Your name" required />
        </label>
        <label class="form-label">
          Email
          <input v-model="email" type="email" class="form-input" placeholder="you@example.com" required />
        </label>
        <label class="form-label">
          Message
          <textarea v-model="message" class="form-input form-textarea" placeholder="Your message…" rows="5" required></textarea>
        </label>
        <button type="submit" class="btn-submit">Send message</button>
      </form>
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
  position: sticky;
  top: 0;
  background: var(--color-surface-0);
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
.contact-content { max-width: 560px; margin: 0 auto; padding: 64px 32px; }
.contact-content h1 { font-size: 36px; font-weight: 800; margin-bottom: 12px; }
.lead { font-size: 16px; color: var(--color-text-2); margin-bottom: 40px; line-height: 1.7; }
.success-msg {
  padding: 16px 20px;
  background: color-mix(in srgb, #46a758 15%, transparent);
  border: 1px solid color-mix(in srgb, #46a758 40%, transparent);
  color: #46a758;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 500;
}
.contact-form { display: flex; flex-direction: column; gap: 18px; }
.form-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-2);
}
.form-input {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-1);
  color: var(--color-text-1);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;
  resize: vertical;
}
.form-input:focus { border-color: var(--color-accent); }
.form-textarea { min-height: 120px; }
.btn-submit {
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: var(--color-accent);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-submit:hover { background: var(--color-accent-hover); }
</style>
