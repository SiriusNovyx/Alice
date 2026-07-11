<template>
  <div class="docs-root">
    <Title title="Alice — Documentation" />

    <aside class="docs-sidebar" :class="{ 'docs-sidebar--open': mobileOpen }">
      <div class="docs-sidebar-header">
        <div class="docs-sidebar-logo">
          <img :src="logoUrl" alt="" class="docs-sidebar-logo-img" width="26" height="26" />
          <span class="docs-sidebar-logo-text">Alice</span>
          <span class="docs-sidebar-logo-badge">Docs</span>
        </div>
        <div class="docs-sidebar-header-actions">
          <ThemeToggle />
          <button type="button" class="docs-sidebar-close" @click="mobileOpen = false" aria-label="Close menu">✕</button>
        </div>
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
        <a class="docs-sidebar-footer-link" href="https://discord.gg/T4BCYpB7yu" target="_blank" rel="noopener noreferrer">Discord</a>
        <a class="docs-sidebar-footer-link" href="https://github.com/SiriusNovyx/Alice" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a class="docs-sidebar-footer-link" href="/dashboard">Dashboard</a>
      </div>
    </aside>

    <div class="docs-overlay" v-if="mobileOpen" @click="mobileOpen = false" aria-hidden="true"></div>

    <header class="docs-topbar">
      <div class="docs-topbar-left">
        <button type="button" class="docs-topbar-menu" @click="mobileOpen = true" aria-label="Open navigation">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 4h14M2 9h14M2 14h14"/></svg>
        </button>
        <img :src="logoUrl" alt="" class="docs-topbar-logo" width="24" height="24" />
        <span class="docs-topbar-title">Alice Docs</span>
      </div>
      <div class="docs-topbar-right">
        <ThemeToggle />
        <a class="docs-topbar-dashboard" href="/dashboard">Dashboard</a>
      </div>
    </header>

    <main class="docs-main" id="docs-content">
      <a href="#docs-content" class="sr-only-focusable">Skip to content</a>
      <router-view :key="$route.fullPath" />
    </main>
  </div>
</template>

<script lang="ts">
import { mapState } from "vuex";
import Title from "../Title.vue";
import ThemeToggle from "../ThemeToggle.vue";

export default {
  components: { Title, ThemeToggle },

  async mounted() {
    await this.$store.dispatch("docs/loadAllPlugins");
  },

  data() {
    return { mobileOpen: false, logoUrl: "/img/logo.png" };
  },

  computed: {
    ...mapState("docs", { plugins: "allPlugins" }),

    computedMenu() {
      return [
        {
          label: "General",
          items: [
            { to: "/docs/introduction", label: "Introduction", icon: "·" },
          ],
        },
        {
          label: "Configuration",
          items: [
            { to: "/docs/configuration/configuration-format", label: "Configuration format", icon: "·" },
            { to: "/docs/configuration/plugin-configuration", label: "Plugin configuration", icon: "·" },
            { to: "/docs/configuration/permissions", label: "Permissions", icon: "·" },
          ],
        },
        {
          label: "Reference",
          items: [
            { to: "/docs/reference/argument-types", label: "Argument types", icon: "·" },
          ],
        },
        {
          label: "Setup Guides",
          items: [
            { to: "/docs/setup-guides/logs", label: "Logs", icon: "·" },
            { to: "/docs/setup-guides/moderation", label: "Moderation", icon: "·" },
            { to: "/docs/setup-guides/counters", label: "Counters", icon: "·" },
          ],
        },
        {
          label: "Plugins",
          items: this.plugins
            .filter((p: any) => p.info.type === "stable")
            .map((p: any) => ({
              to: `/docs/plugins/${p.name}`,
              label: p.info.prettyName || p.name,
              icon: "·",
            })),
        },
        {
          label: "Legacy Plugins",
          items: this.plugins
            .filter((p: any) => p.info.type === "legacy")
            .map((p: any) => ({
              to: `/docs/plugins/${p.name}`,
              label: p.info.prettyName || p.name,
              icon: "·",
            })),
        },
      ].filter((group) => group.items.length > 0);
    },
  },
};
</script>

<style>
@import "../../style/docs.css";
</style>
