<template>
  <div v-if="loading" class="gl-page" aria-busy="true">
    <div class="gl-header">
      <div class="gl-skeleton gl-skeleton--title"></div>
    </div>
    <div class="gl-grid">
      <div class="gl-card gl-card--skeleton" v-for="n in 4" :key="n">
        <div class="gl-skeleton gl-skeleton--icon"></div>
        <div class="gl-skeleton-lines">
          <div class="gl-skeleton gl-skeleton--line-wide"></div>
          <div class="gl-skeleton gl-skeleton--line-narrow"></div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="gl-page">
    <div class="gl-header">
      <h1 class="gl-title">Your Servers</h1>
      <span class="gl-count tabular-nums">{{ guilds.length }} {{ guilds.length === 1 ? "server" : "servers" }}</span>
    </div>

    <div v-if="guilds.length === 0" class="gl-empty">
      <h2 class="gl-empty-title">No servers yet</h2>
      <p class="gl-empty-desc">
        Ask a server owner to grant you dashboard access, then refresh this page.
      </p>
      <button type="button" class="gl-empty-action" @click="reload">Refresh</button>
    </div>

    <div v-else class="gl-grid">
      <div class="gl-card" v-for="guild in guilds" :key="guild.id">
        <div class="gl-icon-wrap">
          <img
            v-if="guild.icon"
            class="gl-icon"
            :src="guild.icon"
            :alt="guild.name"
            width="44"
            height="44"
          />
          <div v-else class="gl-icon gl-icon--fallback" aria-hidden="true">
            {{ guild.name.charAt(0).toUpperCase() }}
          </div>
        </div>

        <div class="gl-info">
          <div class="gl-name" :title="guild.name">{{ guild.name }}</div>
          <div class="gl-id tabular-nums">{{ guild.id }}</div>
        </div>

        <div class="gl-actions">
          <router-link
            class="gl-btn gl-btn--primary"
            :to="'/dashboard/guilds/' + guild.id + '/config'"
          >Config</router-link>
          <router-link
            class="gl-btn"
            :to="'/dashboard/guilds/' + guild.id + '/aio'"
          >AIO</router-link>
          <router-link
            v-if="canManageAccess(guild.id)"
            class="gl-btn"
            :to="'/dashboard/guilds/' + guild.id + '/access'"
          >Access</router-link>
          <router-link
            v-if="canManageAccess(guild.id)"
            class="gl-btn"
            :to="'/dashboard/guilds/' + guild.id + '/import-export'"
          >Import/Export</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from "vuex";
import { ApiPermissions, hasPermission } from "@zeppelinbot/shared/apiPermissions.js";
import { AuthState, GuildState } from "../../store/types";

export default {
  async mounted() {
    await this.load();
  },
  data() {
    return { loading: true };
  },
  computed: {
    ...mapState("guilds", {
      guilds: (state: GuildState) => {
        const guilds = Array.from(state.available.values());
        guilds.sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          if (a.id > b.id) return 1;
          if (a.id < b.id) return -1;
          return 0;
        });
        return guilds;
      },
      guildPermissionAssignments: (state: GuildState) => state.guildPermissionAssignments,
    }),
    ...mapState("auth", {
      userId: (state: AuthState) => state.userId!,
    }),
  },
  methods: {
    async load() {
      this.loading = true;
      await this.$store.dispatch("guilds/loadAvailableGuilds");
      await this.$store.dispatch("guilds/loadMyPermissionAssignments");
      this.loading = false;
    },
    async reload() {
      await this.load();
    },
    canManageAccess(guildId: string) {
      const guildPermissions = this.guildPermissionAssignments[guildId] || [];
      const myPermissions = guildPermissions.find((p) => p.type === "USER" && p.target_id === this.userId) || null;
      return myPermissions && hasPermission(new Set(myPermissions.permissions), ApiPermissions.ManageAccess);
    },
  },
};
</script>

<style scoped>
.gl-page {
  font-family: var(--font-body);
}

.gl-header {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.gl-title {
  font-size: 1.5rem;
  font-weight: 650;
  color: var(--color-text-1);
  margin: 0;
  text-wrap: balance;
}

.gl-count {
  font-size: 0.85rem;
  color: var(--color-text-4);
}

.gl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0.75rem;
}

.gl-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1rem 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.gl-card:hover {
  border-color: var(--color-border-2);
}

.gl-icon-wrap {
  flex-shrink: 0;
}

.gl-icon {
  width: 44px;
  height: 44px;
  border-radius: 11px;
  object-fit: cover;
  display: block;
}

.gl-icon--fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-2);
  color: var(--color-text-2);
  font-weight: 650;
  font-size: 1.05rem;
  width: 44px;
  height: 44px;
  border-radius: 11px;
}

.gl-info {
  flex: 1;
  min-width: 0;
}

.gl-name {
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--color-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.15rem;
}

.gl-id {
  font-size: 0.72rem;
  color: var(--color-text-4);
  font-family: var(--font-mono);
}

.gl-actions {
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  flex-shrink: 0;
}

.gl-btn {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.3rem 0.7rem;
  border-radius: var(--radius-sm);
  text-decoration: none;
  text-align: center;
  background: var(--color-surface-2);
  color: var(--color-text-3);
  border: 1px solid var(--color-border);
  white-space: nowrap;
}

.gl-btn:hover {
  color: var(--color-text-1);
  border-color: var(--color-border-2);
}

.gl-btn--primary {
  background: var(--color-accent-muted);
  color: var(--color-accent);
  border-color: transparent;
}

.gl-btn--primary:hover {
  filter: brightness(1.05);
  color: var(--color-accent);
}

.gl-empty {
  text-align: center;
  padding: 4rem 1.5rem;
  max-width: 24rem;
  margin: 0 auto;
}

.gl-empty-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-1);
  margin: 0 0 0.5rem;
}

.gl-empty-desc {
  font-size: 0.9rem;
  color: var(--color-text-3);
  line-height: 1.65;
  margin: 0 0 1.25rem;
  text-wrap: pretty;
}

.gl-empty-action {
  display: inline-flex;
  padding: 0.5rem 1.1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-1);
  font-size: 0.875rem;
  font-family: inherit;
  cursor: pointer;
}

.gl-empty-action:hover {
  border-color: var(--color-border-2);
  background: var(--color-surface-2);
}

.gl-card--skeleton {
  pointer-events: none;
}

.gl-skeleton {
  background: var(--color-surface-2);
  border-radius: 6px;
}

.gl-skeleton--title {
  width: 160px;
  height: 22px;
}

.gl-skeleton--icon {
  width: 44px;
  height: 44px;
  border-radius: 11px;
  flex-shrink: 0;
}

.gl-skeleton--line-wide {
  width: 55%;
  height: 10px;
}

.gl-skeleton--line-narrow {
  width: 35%;
  height: 8px;
  margin-top: 6px;
}

.gl-skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
}

@media (max-width: 640px) {
  .gl-grid {
    grid-template-columns: 1fr;
  }
}
</style>
