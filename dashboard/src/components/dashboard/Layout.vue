<template>
  <div class="da-root">
    <Title title="Alice — Dashboard" />

    <!-- Sidebar (desktop) -->
    <aside class="da-sidebar">
      <div class="da-sidebar-logo">
        <img :src="logoUrl" alt="Alice" class="da-sidebar-logo-img" />
        <span class="da-sidebar-logo-text">Alice</span>
      </div>

      <nav class="da-sidebar-nav" aria-label="Main navigation">
        <router-link to="/dashboard" class="da-nav-item" active-class="da-nav-item--active">
          <svg class="da-nav-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><rect x="1" y="1" width="7" height="7" rx="1.5"/><rect x="10" y="1" width="7" height="7" rx="1.5"/><rect x="1" y="10" width="7" height="7" rx="1.5"/><rect x="10" y="10" width="7" height="7" rx="1.5"/></svg>
          <span>Servers</span>
        </router-link>
        <a href="/docs" class="da-nav-item">
          <svg class="da-nav-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M3 2h9l3 3v11H3z"/><path d="M12 2v3h3"/><path d="M6 9h6M6 12h4"/></svg>
          <span>Docs</span>
        </a>
      </nav>

      <div class="da-sidebar-footer">
        <button class="da-nav-item da-nav-item--logout" @click="logout">
          <svg class="da-nav-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M7 2H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h4"/><path d="M13 13l3-4-3-4"/><path d="M16 9H7"/></svg>
          <span>Log out</span>
        </button>
      </div>
    </aside>

    <!-- Top bar (mobile) -->
    <header class="da-topbar">
      <div class="da-topbar-left">
        <img :src="logoUrl" alt="Alice" class="da-topbar-logo" />
        <span class="da-topbar-title">Alice</span>
      </div>
      <div class="da-topbar-right">
        <router-link to="/dashboard" class="da-topbar-link">Servers</router-link>
        <a href="/docs" class="da-topbar-link">Docs</a>
        <button class="da-topbar-logout" @click="logout">Log out</button>
      </div>
    </header>

    <!-- Main -->
    <main class="da-main">
      <div class="da-main-inner">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script>
import Title from "../Title.vue";
export default {
  components: { Title },
  data() {
    return { logoUrl: '/img/logo.png' };
  },
  methods: {
    async logout() {
      await this.$store.dispatch("auth/logout");
      window.location.pathname = '/';
    },
  },
};
</script>

<style scoped>
/* ── Root ────────────────────────────────────────────────── */
.da-root {
  display: flex;
  min-height: 100vh;
  background: #080c16;
  color: #cbd5e1;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
}

/* ── Sidebar ─────────────────────────────────────────────── */
.da-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.025);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  padding: 0 0.625rem;
  position: fixed;
  top: 0; left: 0;
  height: 100vh;
  z-index: 30;
}

.da-sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1.25rem 0.5rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 0.5rem;
}

.da-sidebar-logo-img {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  object-fit: cover;
}

.da-sidebar-logo-text {
  font-weight: 700;
  font-size: 1.05rem;
  color: #f1f5f9;
  letter-spacing: -0.02em;
}

.da-sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.da-sidebar-footer {
  padding: 0.75rem 0 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.da-nav-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 400;
  color: #64748b;
  text-decoration: none;
  transition: all 0.14s ease;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.da-nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
}

.da-nav-item--active {
  background: rgba(99, 102, 241, 0.12) !important;
  color: #818cf8 !important;
}

.da-nav-item--logout:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #fca5a5;
}

.da-nav-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  opacity: 0.8;
}

/* ── Mobile topbar ───────────────────────────────────────── */
.da-topbar {
  display: none;
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 40;
  height: 52px;
  background: rgba(8, 12, 22, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0 1rem;
  align-items: center;
  justify-content: space-between;
}

.da-topbar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.da-topbar-logo {
  width: 26px;
  height: 26px;
  border-radius: 7px;
}

.da-topbar-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #f1f5f9;
}

.da-topbar-right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.da-topbar-link {
  font-size: 0.82rem;
  color: #64748b;
  text-decoration: none;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  transition: color 0.14s;
}

.da-topbar-link:hover { color: #94a3b8; }

.da-topbar-logout {
  font-size: 0.82rem;
  color: #64748b;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  transition: color 0.14s;
  font-family: inherit;
}

.da-topbar-logout:hover { color: #fca5a5; }

/* ── Main ────────────────────────────────────────────────── */
.da-main {
  flex: 1;
  margin-left: 220px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.da-main-inner {
  flex: 1;
  padding: 2.5rem 2rem;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 768px) {
  .da-sidebar { display: none; }
  .da-topbar { display: flex; }
  .da-main { margin-left: 0; }
  .da-main-inner { padding: 4.5rem 1rem 2rem; }
}
</style>
