<template>
  <div class="ie-page">
    <router-link to="/dashboard" class="ie-back">← Servers</router-link>
    <h1 class="ie-title">Import / Export</h1>
    <p class="ie-lead">
      <strong>Note:</strong>
      This feature is experimental. Always export a backup before importing.
      Report issues on the
      <a href="https://discord.gg/T4BCYpB7yu" target="_blank" rel="noopener noreferrer">Alice Discord</a>.
    </p>

    <section class="ie-section">
      <h2 class="ie-heading">Export server data</h2>
      <button type="button" class="ie-btn" @click="runExport()" :disabled="exporting">
        {{ exporting ? "Opening…" : "Export data" }}
      </button>
      <p v-if="exporting" class="ie-status">Opened data export in a new window.</p>
    </section>

    <section class="ie-section">
      <h2 class="ie-heading">Import server data</h2>
      <p class="ie-lead">Always take a backup of your existing data above before importing.</p>

      <div class="ie-field">
        <h3 class="ie-subheading">Import file</h3>
        <input type="file" accept="application/json,.json" @change="onFileChange($event)" />
      </div>

      <div class="ie-field">
        <h3 class="ie-subheading">Case options</h3>
        <label class="ie-radio">
          <input type="radio" v-model="importCaseMode" value="bumpImportedCases" />
          Leave existing case numbers; start imported cases from the end
        </label>
        <label class="ie-radio">
          <input type="radio" v-model="importCaseMode" value="bumpExistingCases" />
          Leave imported case numbers; re-number existing cases after them
        </label>
        <label class="ie-radio ie-radio--danger">
          <input type="radio" v-model="importCaseMode" value="replace" />
          Replace existing cases (deletes all existing cases)
        </label>
      </div>

      <button
        type="button"
        class="ie-btn"
        :class="{ 'ie-btn--danger': importCaseMode === 'replace' }"
        @click="runImport()"
        :disabled="importFile == null || importing"
      >
        {{ importing ? "Importing…" : "Import selected file" }}
      </button>

      <p v-if="importError" class="ie-error" role="alert">{{ importError }}</p>
      <p v-else-if="importing" class="ie-status">Importing…</p>
    </section>
  </div>
</template>

<script lang="ts">
import { mapState } from "vuex";
import { GuildState } from "../../store/types";
import { ApiError, formPost } from "../../api";

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

    this.loading = false;
  },
  computed: {
    ...mapState("guilds", {
      guild(guilds: GuildState) {
        return guilds.available.get(this.$route.params.guildId);
      },
    }),
  },
  data() {
    return {
      loading: true,
      importing: false,
      importError: null as string | null,
      importFile: null as File | null,
      importCaseMode: "bumpImportedCases",
      exporting: false,
    };
  },
  methods: {
    onFileChange(ev: Event) {
      const input = ev.target as HTMLInputElement;
      this.selectImportFile(input.files?.[0] ?? null);
    },
    selectImportFile(file: File | null) {
      this.importFile = file;
      this.importError = null;
    },
    async runImport() {
      if (this.importing || !this.importFile) {
        return;
      }

      if (this.importCaseMode === "replace") {
        const ok = window.confirm(
          "This will DELETE ALL EXISTING CASES and replace them with the import. Continue?",
        );
        if (!ok) return;
      }

      this.importError = null;
      this.importing = true;

      try {
        await this.$store.dispatch("guilds/importData", {
          guildId: this.$route.params.guildId,
          data: JSON.parse(await this.importFile.text()),
          caseHandlingMode: this.importCaseMode,
        });
      } catch (err: any) {
        this.importError = err.body?.error ?? String(err);
        return;
      } finally {
        this.importing = false;
        this.importFile = null;
      }

      window.alert("Data imported successfully!");
    },
    async runExport() {
      if (this.exporting) {
        return;
      }

      this.exporting = true;
      formPost(`guilds/${this.$route.params.guildId}/export`, {}, { target: "_blank" });
    },
  },
};
</script>

<style scoped>
.ie-page {
  font-family: var(--font-body);
  max-width: 40rem;
}

.ie-back {
  display: inline-block;
  font-size: 0.82rem;
  color: var(--color-text-4);
  text-decoration: none;
  margin-bottom: 0.75rem;
}

.ie-back:hover {
  color: var(--color-text-2);
}

.ie-title {
  font-size: 1.5rem;
  font-weight: 650;
  color: var(--color-text-1);
  margin: 0 0 0.5rem;
  text-wrap: balance;
}

.ie-lead {
  color: var(--color-text-3);
  font-size: 0.95rem;
  margin: 0 0 1rem;
  text-wrap: pretty;
}

.ie-section {
  margin-top: 1.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border);
}

.ie-heading {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-1);
  margin: 0 0 0.75rem;
}

.ie-subheading {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-1);
  margin: 0 0 0.5rem;
}

.ie-field {
  margin-bottom: 1rem;
}

.ie-radio {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-2);
  margin-bottom: 0.45rem;
  text-wrap: pretty;
}

.ie-radio--danger {
  color: var(--color-danger);
}

.ie-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-1);
  font-size: 0.875rem;
  font-family: inherit;
  cursor: pointer;
}

.ie-btn:hover:not(:disabled) {
  background: var(--color-surface-2);
  border-color: var(--color-border-2);
}

.ie-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.ie-btn--danger {
  border-color: color-mix(in srgb, var(--color-danger) 40%, var(--color-border));
  color: var(--color-danger);
}

.ie-status {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--color-text-3);
}

.ie-error {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--color-danger);
  text-wrap: pretty;
}
</style>
