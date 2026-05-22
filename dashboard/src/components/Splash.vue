<template>
  <div class="splash">
    <div class="splash-bg-grid" aria-hidden="true"></div>
    <div class="splash-orb splash-orb--1" aria-hidden="true"></div>
    <div class="splash-orb splash-orb--2" aria-hidden="true"></div>

    <Title title="Alice — Private Discord Moderation" />

    <transition name="toast">
      <div class="splash-toast" v-if="error" role="alert">
        <span class="splash-toast-icon">⚠</span>
        <span>{{ error }}</span>
      </div>
    </transition>

    <!-- Hero -->
    <section class="splash-hero">
      <!-- Left: character art -->
      <div class="splash-visual">
        <div class="splash-visual-glow" aria-hidden="true"></div>
        <img
          v-if="hasCharacterImage"
          class="splash-char"
          :src="charUrl"
          alt="Alice"
        />
        <div v-else class="splash-char-fallback">
          <div class="splash-char-emoji">🌸</div>
          <div class="splash-char-label">Alice</div>
        </div>
      </div>

      <!-- Right: content -->
      <div class="splash-content">
        <div class="splash-badge">
          <span class="splash-badge-dot" aria-hidden="true"></span>
          Private Beta · By Invitation Only
        </div>

        <h1 class="splash-title">Alice</h1>
        <p class="splash-tagline">Moderation, reimagined.</p>
        <p class="splash-desc">
          Alice is a private, high-performance moderation bot for Discord,
          built for scalability, automation, and reliability.
          Designed for communities that demand the best.
        </p>

        <div class="splash-stats">
          <div class="splash-stat">
            <span class="splash-stat-num">40+</span>
            <span class="splash-stat-label">Plugins</span>
          </div>
          <div class="splash-stat">
            <span class="splash-stat-num">100%</span>
            <span class="splash-stat-label">Configurable</span>
          </div>
          <div class="splash-stat">
            <span class="splash-stat-num">24/7</span>
            <span class="splash-stat-label">Uptime</span>
          </div>
        </div>

        <div class="splash-actions">
          <a class="splash-btn splash-btn--primary" href="/dashboard">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
            Dashboard
          </a>
          <a class="splash-btn splash-btn--secondary" href="/docs">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 2h8l4 4v8H2z"/><path d="M10 2v4h4"/><path d="M5 9h6M5 12h4"/></svg>
            Documentation
          </a>
        </div>

        <nav class="splash-links" aria-label="Footer links">
          <a class="splash-link" href="https://discord.gg/T4BCYpB7yu" target="_blank" rel="noopener noreferrer">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.101 18.08.119 18.1.141 18.11a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
            Discord Server
          </a>
          <span class="splash-link-sep" aria-hidden="true">·</span>
          <a class="splash-link" href="https://github.com/SiriusNovyx/Alice" target="_blank" rel="noopener noreferrer">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            GitHub
          </a>
          <span class="splash-link-sep" aria-hidden="true">·</span>
          <router-link class="splash-link" to="/privacy-policy">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Privacy Policy
          </router-link>
        </nav>
      </div>
    </section>

    <!-- Features strip -->
    <section class="splash-features">
      <p class="splash-features-label">Everything you need to run a great server</p>
      <div class="splash-features-grid">
        <div class="splash-feature" v-for="feature in features" :key="feature.name">
          <div class="splash-feature-icon" aria-hidden="true">{{ feature.icon }}</div>
          <div class="splash-feature-name">{{ feature.name }}</div>
          <div class="splash-feature-desc">{{ feature.desc }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Title from "./Title.vue";

export default {
  components: { Title },

  data() {
    return {
      hasCharacterImage: false,
      features: [
        { icon: "🛡️", name: "Automod", desc: "Intelligent automation for word filters, spam detection, invite blocking, and custom rules." },
        { icon: "📋", name: "Case Tracking", desc: "Full moderation history with notes, image attachments, and case management commands." },
        { icon: "📊", name: "Detailed Logs", desc: "Four separate log channels: mod actions, messages, members, and server changes." },
        { icon: "⚡", name: "Slash Commands", desc: "Full slash command support alongside traditional prefix commands. Works seamlessly." },
        { icon: "🎛️", name: "Web Dashboard", desc: "Configure every aspect of the bot through a clean YAML-based web interface." },
        { icon: "🐌", name: "Smart Slowmode", desc: "Automatically switches between native (≤6h) and bot-enforced slowmodes for any duration." },
      ],
    };
  },

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
