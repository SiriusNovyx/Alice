<template>
  <!-- Loading -->
  <div v-if="loading" class="gl-page">
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

  <!-- Loaded -->
  <div v-else class="gl-page">
    <div class="gl-header">
      <h1 class="gl-title">Your Servers</h1>
      <span class="gl-count">{{ guilds.length }} {{ guilds.length === 1 ? 'server' : 'servers' }}</span>
    </div>

    <!-- Empty -->
    <div v-if="guilds.length === 0" class="gl-empty">
      <div class="gl-empty-icon">🏠</div>
      <div class="gl-empty-title">No servers found</div>
      <div class="gl-empty-desc">You don't have access to any servers yet. Ask your server owner to grant you access.</div>
    </div>

    <!-- Grid -->
    <div v-else class="gl-grid">
      <div class="gl-card" v-for="guild in guilds" :key="guild.id">
        <!-- Icon -->
        <div class="gl-icon-wrap">
          <img
            v-if="guild.icon"
            class="gl-icon"
            :src="guild.icon"
            :alt="guild.name"
          />
          <div v-else class="gl-icon gl-icon--fallback">
            {{ guild.name.charAt(0).toUpperCase() }}
          </div>
        </div>

        <!-- Info -->
        <div class="gl-info">
          <div class="gl-name" :title="guild.name">{{ guild.name }}</div>
          <div class="gl-id">{{ guild.id }}</div>
        </div>

        <!-- Actions -->
        <div class="gl-actions">
          <router-link
            class="gl-btn gl-btn--primary"
            :to="'/dashboard/guilds/' + guild.id + '/config'"
          >Config</router-link>
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
    await this.$store.dispatch("guilds/loadAvailableGuilds");
    await this.$store.dispatch("guilds/loadMyPermissionAssignments");
    this.loading = false;
  },
  data() {
    return { loading: true };
  },
  computed: {
    ...mapState('guilds', {
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
    ...mapState('auth', {
      userId: (state: AuthState) => state.userId!,
    }),
  },
  methods: {
    canManageAccess(guildId: string) {
      const guildPermissions = this.guildPermissionAssignments[guildId] || [];
      const myPermissions = guildPermissions.find(p => p.type === "USER" && p.target_id === this.userId) || null;
      return myPermissions && hasPermission(new Set(myPermissions.permissions), ApiPermissions.ManageAccess);
    },
  },
};
</script>

<style scoped>
/* ── Page ────────────────────────────────────────────────── */
.gl-page {
  animation: gl-fadein 0.35s ease both;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
}

.gl-header {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.gl-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.02em;
  margin: 0;
}

.gl-count {
  font-size: 0.82rem;
  color: #475569;
}

/* ── Grid ────────────────────────────────────────────────── */
.gl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0.75rem;
}

/* ── Card ────────────────────────────────────────────────── */
.gl-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 1rem 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  transition: all 0.16s ease;
  animation: gl-slideup 0.35s ease both;
}

.gl-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(99, 102, 241, 0.22);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

/* ── Icon ────────────────────────────────────────────────── */
.gl-icon-wrap { flex-shrink: 0; }

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
  background: linear-gradient(135deg, #312e81, #4f46e5);
  color: #fff;
  font-weight: 700;
  font-size: 1.05rem;
  width: 44px;
  height: 44px;
  border-radius: 11px;
}

/* ── Info ────────────────────────────────────────────────── */
.gl-info { flex: 1; min-width: 0; }

.gl-name {
  font-weight: 500;
  font-size: 0.9rem;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.15rem;
}

.gl-id {
  font-size: 0.72rem;
  color: #475569;
  font-family: 'Courier New', monospace;
}

/* ── Actions ─────────────────────────────────────────────── */
.gl-actions {
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  flex-shrink: 0;
}

.gl-btn {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.28rem 0.7rem;
  border-radius: 6px;
  text-decoration: none;
  text-align: center;
  transition: all 0.14s ease;
  background: rgba(255, 255, 255, 0.05);
  color: #7a8aa8;
  border: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
}

.gl-btn:hover {
  background: rgba(255, 255, 255, 0.09);
  color: #c8d0e8;
}

.gl-btn--primary {
  background: rgba(99, 102, 241, 0.14);
  color: #a5b4fc;
  border-color: rgba(99, 102, 241, 0.22);
}

.gl-btn--primary:hover {
  background: rgba(99, 102, 241, 0.24);
  color: #c7d2fe;
}

/* ── Empty ───────────────────────────────────────────────── */
.gl-empty {
  text-align: center;
  padding: 5rem 2rem;
  color: #475569;
}

.gl-empty-icon { font-size: 2.5rem; margin-bottom: 1rem; }
.gl-empty-title { font-size: 1.05rem; font-weight: 500; color: #64748b; margin-bottom: 0.5rem; }
.gl-empty-desc { font-size: 0.875rem; max-width: 360px; margin: 0 auto; line-height: 1.65; }

/* ── Skeleton ────────────────────────────────────────────── */
.gl-card--skeleton { pointer-events: none; }

.gl-skeleton {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  animation: gl-pulse 1.5s ease infinite;
}

.gl-skeleton--title  { width: 160px; height: 22px; border-radius: 6px; }
.gl-skeleton--icon   { width: 44px; height: 44px; border-radius: 11px; flex-shrink: 0; }
.gl-skeleton--line-wide   { width: 55%; height: 10px; }
.gl-skeleton--line-narrow { width: 35%; height: 8px; margin-top: 6px; }

.gl-skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* ── Animations ──────────────────────────────────────────── */
@keyframes gl-fadein {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes gl-slideup {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes gl-pulse {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.7; }
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 640px) {
  .gl-grid { grid-template-columns: 1fr; }
}
</style>
