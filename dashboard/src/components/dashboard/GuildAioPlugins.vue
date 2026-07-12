<template>
  <div class="aio-page">
    <div class="aio-header">
      <router-link to="/dashboard" class="aio-back">← Servers</router-link>
      <h1 class="aio-title">{{ guildName }}</h1>
      <span class="aio-subtitle">AIO plugins</span>
    </div>

    <p class="aio-intro">
      Alice AIO modules are configured in guild YAML (same as moderation plugins).
      Use the setup guides for copy-paste snippets, then save in the config editor.
    </p>

    <div class="aio-actions">
      <router-link class="aio-btn aio-btn--primary" :to="configPath">Open config editor</router-link>
      <router-link class="aio-btn" to="/docs/setup-guides/aio-plugins">AIO docs overview</router-link>
    </div>

    <section v-for="group in groups" :key="group.label" class="aio-group">
      <h2 class="aio-group-title">{{ group.label }}</h2>
      <ul class="aio-list">
        <li v-for="item in group.items" :key="item.id" class="aio-item">
          <div class="aio-item-main">
            <div class="aio-item-name">{{ item.name }}</div>
            <div class="aio-item-summary">{{ item.summary }}</div>
          </div>
          <div class="aio-item-links">
            <router-link :to="item.setupPath">Setup</router-link>
            <router-link :to="item.docsPath">Docs</router-link>
            <router-link :to="configPath">YAML</router-link>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts">
import { mapState } from "vuex";
import { GuildState } from "../../store/types";
import { AIO_PLUGIN_NAV, AioPluginNavItem } from "./aioPluginNav";

const PHASE_LABELS: Record<number, string> = {
  1: "Community (Phase 1)",
  2: "Engagement (Phase 2)",
  3: "Support & security (Phase 3)",
  4: "Heavy systems (Phase 4)",
};

export default {
  computed: {
    ...mapState("guilds", {
      available: (state: GuildState) => state.available,
    }),
    guildId(): string {
      return String(this.$route.params.guildId || "");
    },
    guildName(): string {
      const g = this.available.get(this.guildId);
      return g?.name || this.guildId;
    },
    configPath(): string {
      return `/dashboard/guilds/${this.guildId}/config`;
    },
    groups(): { label: string; items: AioPluginNavItem[] }[] {
      return ([1, 2, 3, 4] as const).map((phase) => ({
        label: PHASE_LABELS[phase],
        items: AIO_PLUGIN_NAV.filter((p) => p.phase === phase),
      }));
    },
  },
};
</script>

<style scoped>
.aio-page {
  max-width: 720px;
}

.aio-header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem 1rem;
  margin-bottom: 1rem;
}

.aio-back {
  width: 100%;
  font-size: 0.85rem;
  color: var(--color-text-3);
  text-decoration: none;
}

.aio-back:hover {
  color: var(--color-accent);
}

.aio-title {
  margin: 0;
  font-size: 1.5rem;
  color: var(--color-text-1);
}

.aio-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-3);
}

.aio-intro {
  margin: 0 0 1.25rem;
  color: var(--color-text-2);
  line-height: 1.5;
}

.aio-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.75rem;
}

.aio-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  text-decoration: none;
  color: var(--color-text-2);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
}

.aio-btn:hover {
  color: var(--color-text-1);
  border-color: var(--color-text-3);
}

.aio-btn--primary {
  background: var(--color-accent-muted);
  color: var(--color-accent);
  border-color: transparent;
  font-weight: 500;
}

.aio-group {
  margin-bottom: 1.5rem;
}

.aio-group-title {
  margin: 0 0 0.6rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-1);
}

.aio-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.aio-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  padding: 0.75rem 0.9rem;
  border-top: 1px solid var(--color-border);
}

.aio-item:first-child {
  border-top: none;
}

.aio-item-name {
  font-weight: 500;
  color: var(--color-text-1);
}

.aio-item-summary {
  font-size: 0.82rem;
  color: var(--color-text-3);
  margin-top: 0.15rem;
}

.aio-item-links {
  display: flex;
  gap: 0.75rem;
  font-size: 0.82rem;
}

.aio-item-links a {
  color: var(--color-accent);
  text-decoration: none;
}

.aio-item-links a:hover {
  text-decoration: underline;
}
</style>
