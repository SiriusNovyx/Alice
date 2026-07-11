<template>
  <div class="da-root">
    <Title title="Alice — Dashboard" />

    <aside class="da-sidebar">
      <div class="da-sidebar-logo">
        <img :src="logoUrl" alt="" class="da-sidebar-logo-img" width="28" height="28" />
        <span class="da-sidebar-logo-text">Alice</span>
        <ThemeToggle class="da-sidebar-theme" />
      </div>

      <nav class="da-sidebar-nav" aria-label="Main navigation">
        <router-link to="/dashboard" class="da-nav-item" active-class="da-nav-item--active">
          Servers
        </router-link>
        <a href="/docs" class="da-nav-item">Docs</a>
      </nav>

      <div class="da-sidebar-footer">
        <button type="button" class="da-nav-item da-nav-item--logout" @click="logout">
          Log out
        </button>
      </div>
    </aside>

    <header class="da-topbar">
      <div class="da-topbar-left">
        <img :src="logoUrl" alt="" class="da-topbar-logo" width="24" height="24" />
        <span class="da-topbar-title">Alice</span>
      </div>
      <div class="da-topbar-right">
        <ThemeToggle />
        <router-link to="/dashboard" class="da-topbar-link">Servers</router-link>
        <a href="/docs" class="da-topbar-link">Docs</a>
        <button type="button" class="da-topbar-logout" @click="logout">Log out</button>
      </div>
    </header>

    <main class="da-main">
      <div class="da-main-inner">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script>
import Title from "../Title.vue";
import ThemeToggle from "../ThemeToggle.vue";

export default {
  components: { Title, ThemeToggle },
  data() {
    return { logoUrl: "/img/logo.png" };
  },
  methods: {
    async logout() {
      await this.$store.dispatch("auth/logout");
      window.location.pathname = "/";
    },
  },
};
</script>

<style scoped>
.da-root {
  display: flex;
  min-height: 100dvh;
  background: var(--color-bg);
  color: var(--color-text-2);
  font-family: var(--font-body);
}

.da-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: 0 0.625rem;
  position: fixed;
  top: 0;
  left: 0;
  height: 100dvh;
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
  padding-left: var(--safe-left);
  z-index: var(--z-sticky);
}

.da-sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 0.5rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 0.5rem;
}

.da-sidebar-logo-img {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  object-fit: cover;
}

.da-sidebar-logo-text {
  font-weight: 600;
  font-size: 1rem;
  color: var(--color-text-1);
  flex: 1;
}

.da-sidebar-theme {
  margin-left: auto;
}

.da-sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.da-sidebar-footer {
  padding: 0.75rem 0 1rem;
  border-top: 1px solid var(--color-border);
}

.da-nav-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 450;
  color: var(--color-text-3);
  text-decoration: none;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-family: inherit;
}

.da-nav-item:hover {
  background: var(--color-surface-2);
  color: var(--color-text-1);
}

.da-nav-item--active {
  background: var(--color-accent-muted) !important;
  color: var(--color-accent) !important;
  font-weight: 500;
}

.da-nav-item--logout:hover {
  background: color-mix(in srgb, var(--color-danger) 10%, transparent);
  color: var(--color-danger);
}

.da-topbar {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  height: calc(52px + var(--safe-top));
  padding-top: var(--safe-top);
  background: color-mix(in srgb, var(--color-bg) 92%, transparent);
  border-bottom: 1px solid var(--color-border);
  padding-left: calc(1rem + var(--safe-left));
  padding-right: calc(1rem + var(--safe-right));
  align-items: center;
  justify-content: space-between;
}

.da-topbar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.da-topbar-logo {
  width: 24px;
  height: 24px;
  border-radius: 6px;
}

.da-topbar-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-text-1);
}

.da-topbar-right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.da-topbar-link,
.da-topbar-logout {
  font-size: 0.82rem;
  color: var(--color-text-3);
  text-decoration: none;
  padding: 0.3rem 0.55rem;
  border-radius: var(--radius-sm);
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.da-topbar-link:hover,
.da-topbar-logout:hover {
  color: var(--color-text-1);
}

.da-main {
  flex: 1;
  margin-left: 220px;
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.da-main-inner {
  flex: 1;
  padding: 2rem 1.75rem;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .da-sidebar {
    display: none;
  }

  .da-topbar {
    display: flex;
  }

  .da-main {
    margin-left: 0;
  }

  .da-main-inner {
    padding: calc(4.25rem + var(--safe-top)) 1rem 2rem;
  }
}
</style>
