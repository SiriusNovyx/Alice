<template>
  <div class="docs-root">
    <Title title="Alice — Documentation" />

    <!-- Sidebar -->
    <aside class="docs-sidebar" :class="{ 'docs-sidebar--open': mobileOpen }">
      <div class="docs-sidebar-header">
        <div class="docs-sidebar-logo">
          <img :src="logoUrl" alt="Alice" class="docs-sidebar-logo-img" />
          <span class="docs-sidebar-logo-text">Alice</span>
          <span class="docs-sidebar-logo-badge">Docs</span>
        </div>
        <button class="docs-sidebar-close" @click="mobileOpen = false" aria-label="Close menu">✕</button>
      </div>

      <nav class="docs-sidebar-nav" aria-label="Documentation navigation">
        <div class="docs-nav-group" v-for="group in computedMenu" :key="group.label">
          <div class="docs-nav-group-label">{{ group.label }}</div>
          <router-link
            v-for="item in group.items"
            :key="item.to"
            class="docs-nav-item"
            active-class="docs-nav-item--active"
            :to="item.to"
            @click="mobileOpen = false"
          >
            <span class="docs-nav-icon" aria-hidden="true">{{ item.icon }}</span>
            {{ item.label }}
          </router-link>
        </div>
      </nav>

      <div class="docs-sidebar-footer">
        <a class="docs-sidebar-footer-link" href="https://discord.gg/T4BCYpB7yu" target="_blank" rel="noopener noreferrer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.101 18.08.119 18.1.141 18.11a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.075-.145.03-.334-.123-.397a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
          Discord
        </a>
        <a class="docs-sidebar-footer-link" href="https://github.com/SiriusNovyx/Alice" target="_blank" rel="noopener noreferrer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
          GitHub
        </a>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div class="docs-overlay" v-if="mobileOpen" @click="mobileOpen = false" aria-hidden="true"></div>

    <!-- Top bar (mobile) -->
    <header class="docs-topbar">
      <div class="docs-topbar-left">
        <button class="docs-topbar-menu" @click="mobileOpen = true" aria-label="Open navigation">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4h14M2 9h14M2 14h14"/></svg>
        </button>
        <img :src="logoUrl" alt="Alice" class="docs-topbar-logo" />
        <span class="docs-topbar-title">Alice Docs</span>
      </div>
      <a class="docs-topbar-dashboard" href="/dashboard">Dashboard</a>
    </header>

    <!-- Main -->
    <main class="docs-main" id="docs-content">
      <a href="#docs-content" class="sr-only-focusable">Skip to content</a>
      <router-view :key="$route.fullPath" />
    </main>
  </div>
</template>

<script lang="ts">
import { mapState } from "vuex";
import Title from "../Title.vue";

export default {
  components: { Title },

  async mounted() {
    await this.$store.dispatch("docs/loadAllPlugins");
  },

  data() {
    return { mobileOpen: false };
  },

  computed: {
    ...mapState("docs", { plugins: "allPlugins" }),

    computedMenu() {
      return [
        {
          label: "General",
          items: [
            { to: "/docs/introduction",                       label: "Introduction",          icon: "📖" },
          ],
        },
        {
          label: "Configuration",
          items: [
            { to: "/docs/configuration/configuration-format", label: "Configuration format",  icon: "📄" },
            { to: "/docs/configuration/plugin-configuration", label: "Plugin configuration",  icon: "🧩" },
            { to: "/docs/configuration/permissions",          label: "Permissions",            icon: "🔐" },
          ],
        },
        {
          label: "Reference",
          items: [
            { to: "/docs/reference/argument-types",           label: "Argument types",         icon: "📐" },
          ],
        },
        {
          label: "Setup Guides",
          items: [
            { to: "/docs/setup-guides/logs",       label: "Logs",        icon: "📊" },
            { to: "/docs/setup-guides/moderation", label: "Moderation",  icon: "🛡️" },
            { to: "/docs/setup-guides/counters",   label: "Counters",    icon: "🔢" },
          ],
        },
        {
          label: "Plugins",
          items: this.plugins
            .filter((p: any) => p.info.type === "stable")
            .map((p: any) => ({
              to:    `/docs/plugins/${p.name}`,
              label: p.info.prettyName || p.name,
              icon:  "⚡",
            })),
        },
        {
          label: "Legacy Plugins",
          items: this.plugins
            .filter((p: any) => p.info.type === "legacy")
            .map((p: any) => ({
              to:    `/docs/plugins/${p.name}`,
              label: p.info.prettyName || p.name,
              icon:  "🕰️",
            })),
        },
      ].filter(group => group.items.length > 0);
    },
  },
};
</script>

<style>
@import "../../style/docs.css";
</style>
