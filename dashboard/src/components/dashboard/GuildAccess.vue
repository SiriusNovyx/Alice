<template>
  <div class="ga-page">
    <router-link to="/dashboard" class="ga-back">← Servers</router-link>
    <h1 class="ga-title">Dashboard access</h1>
    <p class="ga-lead">
      Manage who can open this server’s Alice dashboard.
    </p>

    <h2 class="ga-section">Roles</h2>
    <ul class="ga-role-list">
      <li><strong>Owner:</strong> All permissions. Managed automatically by the bot.</li>
      <li><strong>Bot manager:</strong> Can manage dashboard users and edit server configuration.</li>
      <li><strong>Bot operator:</strong> Can edit server configuration.</li>
    </ul>

    <h2 class="ga-section">Dashboard users</h2>
    <div class="ga-block">
      <p v-if="permanentPermissionAssignments.length === 0" class="ga-empty">No dashboard users yet.</p>
      <ul v-if="permanentPermissionAssignments.length" class="ga-user-list">
        <li v-for="perm in permanentPermissionAssignments" :key="perm.type + ':' + perm.target_id">
          <div class="ga-user-row">
            <strong class="ga-user-id tabular-nums">{{ perm.target_id }}</strong>
            <div class="ga-perms">
              <label v-if="isOwner(perm)">
                <input type="checkbox" checked disabled />
                Owner
              </label>
              <label>
                <input
                  type="checkbox"
                  :checked="assignmentHas(perm, ApiPermissions.ManageAccess)"
                  @change="ev => setPermissionValue(perm, ApiPermissions.ManageAccess, ev.target.checked)"
                  :disabled="hasPermissionIndirectly(perm, ApiPermissions.ManageAccess)"
                />
                Bot manager
              </label>
              <label>
                <input
                  type="checkbox"
                  :checked="assignmentHas(perm, ApiPermissions.EditConfig)"
                  @change="ev => setPermissionValue(perm, ApiPermissions.EditConfig, ev.target.checked)"
                  :disabled="hasPermissionIndirectly(perm, ApiPermissions.EditConfig)"
                />
                Bot operator
              </label>
              <button
                v-if="!isOwner(perm)"
                type="button"
                class="ga-link-btn ga-danger"
                @click="confirmDelete(perm)"
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      </ul>
      <button type="button" class="ga-link-btn" @click="addPermissionAssignment">
        Add new user
      </button>
    </div>

    <h2 class="ga-section">Temporary dashboard users</h2>
    <p class="ga-lead">
      Temporary users always have <strong>Bot operator</strong> permissions (e.g. for outside help).
    </p>
    <div class="ga-block">
      <p v-if="temporaryPermissionAssignments.length === 0" class="ga-empty">No temporary dashboard users.</p>
      <ul v-if="temporaryPermissionAssignments.length" class="ga-user-list">
        <li v-for="perm in temporaryPermissionAssignments" :key="'tmp:' + perm.type + ':' + perm.target_id">
          <div class="ga-user-row">
            <strong class="ga-user-id tabular-nums">{{ perm.target_id }}</strong>
            <span class="ga-expiry">Expires in {{ formatTimeRemaining(perm) }}</span>
            <button type="button" class="ga-link-btn ga-danger" @click="confirmDelete(perm)">Delete</button>
          </div>
        </li>
      </ul>
      <button type="button" class="ga-link-btn" @click="addTemporaryPermissionAssignment">
        Add temporary user for 1 hour
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from "vuex";
import { ApiPermissions, hasPermission } from "@zeppelinbot/shared/apiPermissions.js";
import { GuildPermissionAssignment, GuildState } from "../../store/types";
import { ApiError } from "../../api";
import moment from "moment";
import humanizeDuration from "humanize-duration";

export default {
  async mounted() {
    try {
      await this.$store.dispatch("guilds/loadGuild", this.$route.params.guildId);
    } catch (err) {
      if (err instanceof ApiError) {
        this.$router.push("/dashboard");
        return;
      }
      throw err;
    }

    if (this.guild == null) {
      this.$router.push("/dashboard");
      return;
    }

    await this.$store.dispatch("guilds/loadGuildPermissionAssignments", this.$route.params.guildId);
  },
  data() {
    return { ApiPermissions };
  },
  computed: {
    ...mapState("guilds", {
      guild(guilds: GuildState) {
        return guilds.available.get(this.$route.params.guildId);
      },
      permissionAssignments(guilds: GuildState): GuildPermissionAssignment[] {
        return guilds.guildPermissionAssignments[this.$route.params.guildId] || [];
      },
    }),
    permanentPermissionAssignments(): GuildPermissionAssignment[] {
      return this.permissionAssignments.filter((p) => !p.expires_at);
    },
    temporaryPermissionAssignments(): GuildPermissionAssignment[] {
      return this.permissionAssignments.filter((p) => p.expires_at);
    },
  },
  methods: {
    isOwner(perm: GuildPermissionAssignment) {
      return hasPermission(perm.permissions, ApiPermissions.Owner);
    },
    assignmentHas(perm: GuildPermissionAssignment, permission: ApiPermissions) {
      return hasPermission(perm.permissions, permission);
    },
    hasPermissionIndirectly(perm: GuildPermissionAssignment, permission: ApiPermissions) {
      if (this.isOwner(perm)) return true;
      if (permission === ApiPermissions.EditConfig && this.assignmentHas(perm, ApiPermissions.ManageAccess)) {
        return true;
      }
      return false;
    },
    permissionsToArray(perms: Set<ApiPermissions>): ApiPermissions[] {
      return Array.from(perms);
    },
    async persistPermissions(
      perm: Pick<GuildPermissionAssignment, "type" | "target_id" | "expires_at">,
      permissions: ApiPermissions[],
    ) {
      await this.$store.dispatch("guilds/setTargetPermissions", {
        guildId: this.$route.params.guildId,
        targetId: perm.target_id,
        type: perm.type,
        permissions,
        expiresAt: perm.expires_at ?? null,
      });
    },
    async setPermissionValue(perm: GuildPermissionAssignment, permission: ApiPermissions, value: boolean) {
      const next = new Set(perm.permissions);
      if (value) {
        next.add(permission);
      } else {
        next.delete(permission);
      }
      // Ensure nested baseline view permissions stay present when granting edit/manage
      if (value && (permission === ApiPermissions.ManageAccess || permission === ApiPermissions.EditConfig)) {
        next.add(ApiPermissions.ReadConfig);
        next.add(ApiPermissions.ViewGuild);
      }
      await this.persistPermissions(perm, this.permissionsToArray(next));
    },
    async addPermissionAssignment() {
      const targetId = window.prompt("Enter the Discord user ID to add:");
      if (!targetId) return;
      await this.$store.dispatch("guilds/setTargetPermissions", {
        guildId: this.$route.params.guildId,
        targetId: targetId.trim(),
        type: "USER",
        permissions: [ApiPermissions.EditConfig, ApiPermissions.ReadConfig, ApiPermissions.ViewGuild],
        expiresAt: null,
      });
    },
    async addTemporaryPermissionAssignment() {
      const targetId = window.prompt("Enter the Discord user ID to add temporarily:");
      if (!targetId) return;
      await this.$store.dispatch("guilds/setTargetPermissions", {
        guildId: this.$route.params.guildId,
        targetId: targetId.trim(),
        type: "USER",
        permissions: [ApiPermissions.EditConfig, ApiPermissions.ReadConfig, ApiPermissions.ViewGuild],
        expiresAt: moment().add(1, "hour").toISOString(),
      });
    },
    confirmDelete(perm: GuildPermissionAssignment) {
      if (!window.confirm(`Remove dashboard access for ${perm.target_id}?`)) {
        return;
      }
      this.deletePermissionAssignment(perm);
    },
    async deletePermissionAssignment(perm: GuildPermissionAssignment) {
      await this.persistPermissions(perm, []);
    },
    formatTimeRemaining(perm: GuildPermissionAssignment) {
      if (!perm.expires_at) return "";
      const ms = moment(perm.expires_at).diff(moment());
      if (ms <= 0) return "expired";
      return humanizeDuration(ms, { largest: 2, round: true });
    },
  },
};
</script>

<style scoped>
.ga-page {
  font-family: var(--font-body);
  max-width: 40rem;
}

.ga-back {
  display: inline-block;
  font-size: 0.82rem;
  color: var(--color-text-4);
  text-decoration: none;
  margin-bottom: 0.75rem;
}

.ga-back:hover {
  color: var(--color-text-2);
}

.ga-title {
  font-size: 1.5rem;
  font-weight: 650;
  color: var(--color-text-1);
  margin: 0 0 0.5rem;
  text-wrap: balance;
}

.ga-lead {
  color: var(--color-text-3);
  font-size: 0.95rem;
  margin: 0 0 1rem;
  text-wrap: pretty;
}

.ga-section {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-1);
  margin: 1.75rem 0 0.75rem;
}

.ga-role-list,
.ga-user-list {
  margin: 0 0 0.75rem;
  padding-left: 1.15rem;
  color: var(--color-text-3);
  font-size: 0.9rem;
  line-height: 1.65;
}

.ga-block {
  margin-bottom: 0.5rem;
}

.ga-empty {
  color: var(--color-text-4);
  font-size: 0.9rem;
  margin: 0 0 0.75rem;
}

.ga-user-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1rem;
  margin-bottom: 0.65rem;
}

.ga-user-id {
  color: var(--color-text-1);
  font-family: var(--font-mono);
  font-size: 0.85rem;
}

.ga-perms {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: var(--color-text-2);
}

.ga-expiry {
  font-size: 0.85rem;
  color: var(--color-text-3);
}

.ga-link-btn {
  background: none;
  border: none;
  padding: 0;
  color: var(--color-accent-2);
  font-size: 0.875rem;
  cursor: pointer;
  font-family: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.ga-link-btn:hover {
  color: var(--color-accent);
}

.ga-danger {
  color: var(--color-danger);
}

.ga-danger:hover {
  color: var(--color-danger);
  filter: brightness(1.1);
}
</style>
