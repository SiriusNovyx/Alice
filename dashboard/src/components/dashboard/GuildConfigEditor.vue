<template>
  <div v-if="loading" class="config-page">
    <div class="config-header">
      <div class="skeleton-line skeleton-line--title"></div>
    </div>
    <div class="editor-shell editor-shell--loading">
      <div class="loading-inner">
        <div class="loading-spinner"></div>
        <span>Loading config…</span>
      </div>
    </div>
  </div>

  <div v-else class="config-page">
    <!-- Header -->
    <div class="config-header">
      <div class="config-header-left">
        <router-link to="/dashboard" class="back-link">← Servers</router-link>
        <h1 class="config-title">{{ guild.name }}</h1>
        <span class="config-subtitle">Configuration Editor</span>
      </div>
      <div class="config-header-right">
        <span class="shortcut-hint">{{ isMac ? '⌘' : 'Ctrl' }}+S to save</span>
        <button
          class="save-btn"
          :class="{
            'save-btn--saving': saving,
            'save-btn--saved': saved,
          }"
          :disabled="saving"
          @click="save"
        >
          <span v-if="saving" class="save-spinner"></span>
          <span v-else-if="saved">✓ Saved</span>
          <span v-else>Save Config</span>
        </button>
      </div>
    </div>

    <!-- Error panel -->
    <transition name="errors">
      <div v-if="errors.length" class="error-panel">
        <div class="error-panel-header">
          <span class="error-panel-icon">⚠</span>
          <span class="error-panel-title">Config errors — fix these before saving</span>
          <button class="error-panel-close" @click="errors = []">✕</button>
        </div>
        <pre v-for="(error, i) in errors" :key="i" class="error-item">{{ error }}</pre>
      </div>
    </transition>

    <!-- Editor -->
    <div class="editor-shell">
      <!-- Status bar -->
      <div class="editor-statusbar">
        <span class="statusbar-lang">YAML</span>
        <span class="statusbar-hint">Configure your server's plugins, permissions, and automod rules</span>
      </div>
      <v-ace-editor
        class="ace-editor"
        v-model:value="editableConfig"
        @init="editorInit"
        lang="yaml"
        theme="tomorrow_night"
        ref="aceEditor"
        :options="{
          useSoftTabs: true,
          tabSize: 2,
          fontSize: 14,
          showPrintMargin: false,
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          fontFamily: '\'JetBrains Mono\', \'Fira Code\', monospace',
        }"
        :style="{
          width: editorWidth + 'px',
          height: editorHeight + 'px',
        }"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from "vuex";
import { ApiError } from "../../api";
import { GuildState } from "../../store/types";
import { VAceEditor } from "vue3-ace-editor";

import "ace-builds/src-noconflict/ext-language_tools";
import 'ace-builds/src-noconflict/ext-searchbox';
import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/theme-tomorrow_night";

let editorKeybindListener;
let windowResizeListener;

export default {
  components: { VAceEditor },
  async mounted() {
    try {
      await this.$store.dispatch("guilds/loadGuild", this.$route.params.guildId);
    } catch (err) {
      if (err instanceof ApiError) {
        this.$router.push('/dashboard');
        return;
      }
      throw err;
    }

    if (this.guild == null) {
      this.$router.push('/dashboard');
      return;
    }

    await this.$store.dispatch("guilds/loadConfig", this.$route.params.guildId);
    this.editableConfig = this.config || "";
    this.loading = false;
  },
  beforeRouteLeave(to, from, next) {
    if (editorKeybindListener) {
      window.removeEventListener("keydown", editorKeybindListener);
      editorKeybindListener = null;
    }
    if (windowResizeListener) {
      window.removeEventListener("resize", windowResizeListener);
      windowResizeListener = null;
    }
    next();
  },
  data() {
    return {
      loading: true,
      saving: false,
      saved: false,
      editableConfig: null,
      errors: [],
      editorWidth: 900,
      editorHeight: 600,
      savedTimeout: null,
      isMac: /mac/i.test(navigator.platform),
    };
  },
  computed: {
    ...mapState("guilds", {
      guild(guilds: GuildState) {
        return guilds.available.get(this.$route.params.guildId);
      },
      config(guilds: GuildState) {
        return guilds.configs[this.$route.params.guildId];
      },
    }),
  },
  methods: {
    editorInit() {
      const isMac = this.isMac;
      const modKeyPressed = (ev: KeyboardEvent) => (isMac ? ev.metaKey : ev.ctrlKey);
      const nonModKeyPressed = (ev: KeyboardEvent) => (isMac ? ev.ctrlKey : ev.metaKey);
      const shortcutModifierPressed = (ev: KeyboardEvent) => modKeyPressed(ev) && !nonModKeyPressed(ev) && !ev.altKey;

      if (editorKeybindListener) {
        window.removeEventListener("keydown", editorKeybindListener);
      }

      editorKeybindListener = (ev: KeyboardEvent) => {
        if (shortcutModifierPressed(ev) && ev.key === "s") {
          ev.preventDefault();
          this.save();
          return;
        }
        if (shortcutModifierPressed(ev) && ev.key === "f") {
          ev.preventDefault();
          this.$refs.aceEditor.getAceInstance().execCommand("find");
          return;
        }
      };
      window.addEventListener("keydown", editorKeybindListener);

      this.fitEditorToWindow();

      if (windowResizeListener) {
        window.removeEventListener("resize", windowResizeListener);
      }

      let debounceTimeout;
      windowResizeListener = () => {
        if (debounceTimeout) clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => this.fitEditorToWindow(), 350);
      };
      window.addEventListener("resize", windowResizeListener);
    },
    fitEditorToWindow() {
      const editorElem = this.$refs.aceEditor?.$el;
      if (!editorElem) return;
      const newWidth = editorElem.parentNode.clientWidth;
      const rect = editorElem.getBoundingClientRect();
      const newHeight = Math.max(400, Math.round(window.innerHeight - rect.top - 24));
      this.resizeEditor(newWidth, newHeight);
    },
    resizeEditor(newWidth, newHeight) {
      this.editorWidth = newWidth;
      this.editorHeight = newHeight;
      this.$nextTick(() => {
        this.$refs.aceEditor?.getAceInstance().resize();
      });
    },
    async save() {
      if (this.saving) return;
      this.saved = false;
      this.saving = true;
      this.errors = [];

      if (this.savedTimeout) clearTimeout(this.savedTimeout);

      const minWaitTime = new Promise(resolve => setTimeout(resolve, 300));

      try {
        await this.$store.dispatch("guilds/saveConfig", {
          guildId: this.$route.params.guildId,
          config: this.editableConfig,
        });
        await minWaitTime;
        this.saving = false;
        this.saved = true;
        this.savedTimeout = setTimeout(() => (this.saved = false), 3000);
      } catch (e) {
        if (e instanceof ApiError && (e.status === 400 || e.status === 422)) {
          this.errors = e.body.errors || ['Error while saving config'];
          this.saving = false;
          return;
        }
        throw e;
      }
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');

/* ── Page ────────────────────────────────────────────────── */
.config-page {
  font-family: 'DM Sans', sans-serif;
  animation: fadeIn 0.35s ease both;
}

/* ── Header ──────────────────────────────────────────────── */
.config-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.config-header-left {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.back-link {
  font-size: 0.82rem;
  color: #4b5572;
  text-decoration: none;
  transition: color 0.15s;
  margin-bottom: 0.1rem;
}

.back-link:hover { color: #8b96b8; }

.config-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #e8ecf4;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.config-subtitle {
  font-size: 0.82rem;
  color: #4b5572;
}

.config-header-right {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding-top: 0.25rem;
}

.shortcut-hint {
  font-size: 0.78rem;
  color: #4b5572;
}

/* ── Save button ─────────────────────────────────────────── */
.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.4rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.18s ease;
  background: linear-gradient(135deg, #5b6fff, #4a5ce8);
  color: #fff;
  box-shadow: 0 3px 14px rgba(91, 111, 255, 0.3);
  min-width: 120px;
  justify-content: center;
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #6b7fff, #5a6cf8);
  box-shadow: 0 5px 18px rgba(91, 111, 255, 0.45);
  transform: translateY(-1px);
}

.save-btn:disabled { opacity: 0.7; cursor: not-allowed; }

.save-btn--saved {
  background: linear-gradient(135deg, #22c55e, #16a34a) !important;
  box-shadow: 0 3px 14px rgba(34, 197, 94, 0.3) !important;
}

.save-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* ── Error panel ─────────────────────────────────────────── */
.error-panel {
  background: rgba(220, 60, 60, 0.08);
  border: 1px solid rgba(220, 60, 60, 0.25);
  border-radius: 10px;
  padding: 0.875rem 1rem;
  margin-bottom: 1rem;
}

.error-panel-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.error-panel-icon { color: #f08080; font-size: 0.95rem; }

.error-panel-title {
  flex: 1;
  font-size: 0.88rem;
  font-weight: 500;
  color: #f08080;
}

.error-panel-close {
  background: none;
  border: none;
  color: #7a86a8;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  transition: color 0.15s;
}

.error-panel-close:hover { color: #c8d0e8; }

.error-item {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: #f08080;
  margin: 0;
  padding: 0.25rem 0;
  white-space: pre-wrap;
  word-break: break-all;
}

/* ── Editor shell ────────────────────────────────────────── */
.editor-shell {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.editor-shell--loading {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.02);
}

.loading-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #4b5572;
  font-size: 0.9rem;
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(91, 111, 255, 0.2);
  border-top-color: #5b6fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.editor-statusbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.4rem 0.85rem;
  background: rgba(255, 255, 255, 0.035);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.statusbar-lang {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  color: #5b6fff;
  background: rgba(91, 111, 255, 0.1);
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

.statusbar-hint {
  font-size: 0.75rem;
  color: #4b5572;
}

.ace-editor {
  /* ace editor fills the shell */
}

/* ── Skeleton ────────────────────────────────────────────── */
.skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: rgba(255,255,255,0.06);
  animation: pulse 1.4s ease infinite;
}

.skeleton-line--title {
  width: 200px;
  height: 24px;
  margin-bottom: 1.5rem;
}

/* ── Transitions ─────────────────────────────────────────── */
.errors-enter-active, .errors-leave-active { transition: all 0.25s ease; }
.errors-enter-from, .errors-leave-to { opacity: 0; transform: translateY(-8px); }

/* ── Keyframes ───────────────────────────────────────────── */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.7; }
}
</style>
