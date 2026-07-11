<template>
  <div class="splash">
    <Title title="Alice — Private Discord Moderation" />

    <div v-if="error" class="splash-toast" role="alert">
      <span>{{ error }}</span>
    </div>

    <header class="splash-bar">
      <div class="splash-bar-brand">
        <img class="splash-bar-logo" src="/img/logo.png" alt="" width="28" height="28" />
        <span class="splash-bar-name">Alice</span>
      </div>
      <ThemeToggle />
    </header>

    <main class="splash-main">
      <p class="splash-eyebrow">Private moderation for Discord</p>
      <h1 class="splash-title">Alice</h1>
      <p class="splash-desc">
        Configurable plugins, slash commands, and a YAML dashboard — built for communities that need reliable moderation at scale.
      </p>

      <div class="splash-actions">
        <a class="splash-btn splash-btn--primary" href="/dashboard">Dashboard</a>
        <a class="splash-btn splash-btn--secondary" href="/docs">Documentation</a>
      </div>

      <nav class="splash-links" aria-label="Footer links">
        <a class="splash-link" href="https://discord.gg/T4BCYpB7yu" target="_blank" rel="noopener noreferrer">Discord</a>
        <span class="splash-link-sep" aria-hidden="true">·</span>
        <a class="splash-link" href="https://github.com/SiriusNovyx/Alice" target="_blank" rel="noopener noreferrer">GitHub</a>
        <span class="splash-link-sep" aria-hidden="true">·</span>
        <router-link class="splash-link" to="/privacy-policy">Privacy</router-link>
      </nav>
    </main>
  </div>
</template>

<script lang="ts">
import Title from "./Title.vue";
import ThemeToggle from "./ThemeToggle.vue";

export default {
  components: { Title, ThemeToggle },

  computed: {
    error(): string | null {
      const errorMessages: Record<string, string> = {
        noAccess: "No dashboard access. Contact your server owner if you think this is a mistake.",
        expiredLogin: "Session expired. Please log in again.",
      };
      const queryError = this.$route?.query?.error;
      return queryError ? (errorMessages[String(queryError)] ?? null) : null;
    },
  },
};
</script>

<style>
@import "../style/splash.css";
</style>
