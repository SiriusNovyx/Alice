<template>
  <div class="splash">
    <!-- Animated background grid -->
    <div class="bg-grid" aria-hidden="true"></div>
    <!-- Glow orbs -->
    <div class="orb orb-1" aria-hidden="true"></div>
    <div class="orb orb-2" aria-hidden="true"></div>

    <!-- Error toast -->
    <transition name="toast">
      <div class="error-toast" v-if="error" role="alert">
        <span class="error-icon">⚠</span>
        <span>{{ error }}</span>
      </div>
    </transition>

    <div class="splash-inner">
      <!-- Logo -->
      <div class="logo-wrap">
        <img class="logo" src="/img/logo.png" alt="Alice Logo" />
        <div class="logo-ring" aria-hidden="true"></div>
      </div>

      <!-- Heading -->
      <h1 class="title">
        <span class="title-main">Alice</span>
        <span class="title-badge">v2</span>
      </h1>
      <p class="subtitle">Private moderation infrastructure for Discord.<br>Reliable, configurable, and built for scale.</p>

      <!-- Actions -->
      <div class="actions">
        <a class="btn btn-primary" href="/dashboard">
          <span class="btn-icon">⚡</span>
          Dashboard
        </a>
        <a class="btn btn-secondary" href="/docs">
          <span class="btn-icon">📖</span>
          Documentation
        </a>
      </div>

      <!-- Feature pills -->
      <div class="features">
        <span class="feature-pill">Automod</span>
        <span class="feature-pill">Case Tracking</span>
        <span class="feature-pill">Slash Commands</span>
        <span class="feature-pill">Censor</span>
        <span class="feature-pill">Logs</span>
        <span class="feature-pill">Slowmode</span>
        <span class="feature-pill">Reaction Roles</span>
        <span class="feature-pill">Starboard</span>
      </div>

      <!-- Footer links -->
      <nav class="footer-links" aria-label="External links">
        <a href="/privacy-policy">Privacy Policy</a>
        <span class="divider" aria-hidden="true">·</span>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const errorMessages: Record<string, string> = {
  noAccess: "No dashboard access. Contact your server owner if you think this is a mistake.",
  expiredLogin: "Session expired. Please log in again.",
};

const route = useRoute();
const error = ref<string | null>(null);

watch(
  () => route.query.error,
  (value) => {
    error.value = errorMessages[String(value)] ?? null;
  },
  { immediate: true },
);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');

/* ── Layout ─────────────────────────────────────────────── */
.splash {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  background: #080b14;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Sans', sans-serif;
  color: #e8ecf4;
}

.splash-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1.5rem 3rem;
  max-width: 680px;
  width: 100%;
  animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* ── Background effects ──────────────────────────────────── */
.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(99, 120, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 120, 255, 0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%);
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.18;
  pointer-events: none;
  animation: drift 12s ease-in-out infinite alternate;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #5b6fff, #2d3acc);
  top: -120px;
  left: -80px;
  animation-duration: 14s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #a855f7, #6d28d9);
  bottom: -80px;
  right: -60px;
  animation-duration: 18s;
  animation-delay: -6s;
}

/* ── Logo ────────────────────────────────────────────────── */
.logo-wrap {
  position: relative;
  width: 100px;
  height: 100px;
  margin-bottom: 1.75rem;
}

.logo {
  width: 100%;
  height: 100%;
  border-radius: 24px;
  object-fit: cover;
  position: relative;
  z-index: 1;
  box-shadow: 0 0 40px rgba(91, 111, 255, 0.35);
}

.logo-ring {
  position: absolute;
  inset: -6px;
  border-radius: 30px;
  background: conic-gradient(from 0deg, #5b6fff, #a855f7, #5b6fff);
  z-index: 0;
  opacity: 0.6;
  animation: spin 6s linear infinite;
  mask: radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px));
}

/* ── Heading ─────────────────────────────────────────────── */
.title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(3.5rem, 10vw, 6rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.title-main {
  background: linear-gradient(135deg, #fff 30%, #a8b4ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-badge {
  font-size: 1rem;
  font-weight: 700;
  background: rgba(91, 111, 255, 0.2);
  border: 1px solid rgba(91, 111, 255, 0.4);
  color: #a8b4ff;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  letter-spacing: 0.05em;
  font-family: 'DM Sans', sans-serif;
  -webkit-text-fill-color: #a8b4ff;
}

.subtitle {
  font-size: 1.05rem;
  font-weight: 300;
  color: #8b96b8;
  line-height: 1.65;
  margin-bottom: 2.25rem;
  max-width: 480px;
}

/* ── Actions ─────────────────────────────────────────────── */
.actions {
  display: flex;
  gap: 0.875rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.65rem 1.6rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.18s ease;
  cursor: pointer;
}

.btn-icon {
  font-size: 0.9rem;
}

.btn-primary {
  background: linear-gradient(135deg, #5b6fff, #4a5ce8);
  color: #fff;
  box-shadow: 0 4px 20px rgba(91, 111, 255, 0.35);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(91, 111, 255, 0.5);
  background: linear-gradient(135deg, #6b7fff, #5a6cf8);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #c4cde8;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.18);
  color: #fff;
}

/* ── Feature pills ───────────────────────────────────────── */
.features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 2.5rem;
  max-width: 520px;
}

.feature-pill {
  font-size: 0.78rem;
  font-weight: 500;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: rgba(91, 111, 255, 0.1);
  border: 1px solid rgba(91, 111, 255, 0.2);
  color: #8fa0e8;
  letter-spacing: 0.02em;
  transition: all 0.15s ease;
}

.feature-pill:hover {
  background: rgba(91, 111, 255, 0.18);
  color: #c4cde8;
}

/* ── Footer links ────────────────────────────────────────── */
.footer-links {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.82rem;
  color: #4b5572;
}

.footer-links a {
  color: #4b5572;
  text-decoration: none;
  transition: color 0.15s;
}

.footer-links a:hover {
  color: #8b96b8;
}

.divider {
  opacity: 0.4;
}

/* ── Error toast ─────────────────────────────────────────── */
.error-toast {
  position: fixed;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(220, 60, 60, 0.12);
  border: 1px solid rgba(220, 60, 60, 0.3);
  color: #f08080;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-size: 0.9rem;
  backdrop-filter: blur(12px);
  white-space: nowrap;
}

.error-icon {
  font-size: 1rem;
}

/* ── Transitions ─────────────────────────────────────────── */
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(-8px); }

/* ── Keyframes ───────────────────────────────────────────── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes drift {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(30px, 20px) scale(1.08); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 480px) {
  .actions { flex-direction: column; width: 100%; }
  .btn { justify-content: center; }
}
</style>
