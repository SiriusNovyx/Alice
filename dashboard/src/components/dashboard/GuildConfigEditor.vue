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
        <div v-for="(error, i) in errors" :key="i" class="error-block">
          <pre class="error-item">{{ error.message }}</pre>
          <p v-if="error.hint" class="error-hint">{{ error.hint }}</p>
          <div v-if="error.docsPath || error.line" class="error-actions">
            <router-link
              v-if="error.docsPath"
              class="error-docs-link"
              :to="error.docsPath"
            >Open docs</router-link>
            <button
              v-if="error.line"
              type="button"
              class="error-goto-line"
              @click="goToErrorLine(error.line)"
            >Go to line {{ error.line }}</button>
          </div>
          <div v-if="error.fix" class="error-fix">
            <p class="error-fix-desc">{{ error.fix.description }}</p>
            <pre class="error-fix-preview">{{ fixPreview(error.fix.proposedYaml) }}</pre>
            <div class="error-fix-actions">
              <button type="button" class="error-fix-apply" @click="applyFix(i)">
                Apply fix
              </button>
              <button type="button" class="error-fix-dismiss" @click="dismissFix(i)">
                Dismiss
              </button>
            </div>
          </div>
        </div>
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
import { assistConfigError, ConfigErrorAssist } from "../../utils/configErrorAssist";
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
      errors: [] as ConfigErrorAssist[],
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
    goToErrorLine(line: number) {
      const ace = this.$refs.aceEditor?.getAceInstance();
      if (!ace || !line) return;
      ace.gotoLine(line, 0, true);
      ace.focus();
    },
    fixPreview(proposedYaml: string) {
      const max = 280;
      const trimmed = (proposedYaml || "").trimEnd();
      if (trimmed.length <= max) return trimmed;
      return trimmed.slice(0, max) + "…";
    },
    applyFix(index: number) {
      const error = this.errors[index];
      if (!error?.fix?.proposedYaml) return;
      const beforeLen = (this.editableConfig || "").length;
      const proposedLen = error.fix.proposedYaml.length;
      this.editableConfig = error.fix.proposedYaml;
      // #region agent log
      fetch("http://127.0.0.1:7479/ingest/baa7822e-5ee3-4e53-8db8-46db577342c6", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "38d402",
        },
        body: JSON.stringify({
          sessionId: "38d402",
          runId: "pre-fix",
          hypothesisId: "C",
          location: "GuildConfigEditor.vue:applyFix",
          message: "applyFix applied",
          data: {
            index,
            beforeLen,
            proposedLen,
            afterLen: (this.editableConfig || "").length,
            description: error.fix.description,
            editorUpdated: this.editableConfig === error.fix.proposedYaml,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      this.errors = [];
    },
    dismissFix(index: number) {
      const error = this.errors[index];
      if (!error) return;
      // Clear just this proposal; keep the error row for manual fixing
      this.errors.splice(index, 1, { ...error, fix: null });
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
        // #region agent log
        fetch("http://127.0.0.1:7479/ingest/baa7822e-5ee3-4e53-8db8-46db577342c6", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "38d402",
          },
          body: JSON.stringify({
            sessionId: "38d402",
            runId: "pre-fix",
            hypothesisId: "E",
            location: "GuildConfigEditor.vue:save",
            message: "save succeeded",
            data: { configLen: (this.editableConfig || "").length },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
      } catch (e) {
        if (e instanceof ApiError && (e.status === 400 || e.status === 422)) {
          const rawErrors = e.body.errors || ["Error while saving config"];
          let pluginLoadOk = false;
          let pluginLoadError: string | null = null;
          try {
            await this.$store.dispatch("docs/loadAllPlugins");
            pluginLoadOk = true;
          } catch (loadErr: any) {
            // Plugin names are optional for fuzzy rename; continue without them
            pluginLoadError = String(loadErr?.message || loadErr);
          }
          const knownPluginNames = (this.$store.state.docs?.allPlugins || []).map(
            (p: { name: string }) => p.name,
          );
          let knownConfigKeys: string[] = [];
          const pluginFromError = String(rawErrors[0] || "").match(
            /^([a-z][a-z0-9_]*)\s*:/i,
          );
          if (pluginFromError) {
            const pluginName = pluginFromError[1];
            try {
              await this.$store.dispatch("docs/loadPluginData", pluginName);
              const defaults =
                this.$store.state.docs?.plugins?.[pluginName]?.defaultOptions || {};
              knownConfigKeys = Object.keys(defaults);
            } catch {
              // optional — Did-you-mean for config keys degrades without it
            }
          }
          this.errors = rawErrors.map((err: string) =>
            assistConfigError(err, this.editableConfig, knownPluginNames, knownConfigKeys),
          );
          // #region agent log
          fetch("http://127.0.0.1:7479/ingest/baa7822e-5ee3-4e53-8db8-46db577342c6", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Debug-Session-Id": "38d402",
            },
            body: JSON.stringify({
              sessionId: "38d402",
              runId: "post-fix",
              hypothesisId: "F",
              location: "GuildConfigEditor.vue:save",
              message: "save validation failed; assist built",
              data: {
                status: e.status,
                rawErrors: rawErrors.map((r: string) => String(r).slice(0, 200)),
                pluginLoadOk,
                pluginLoadError,
                knownPluginCount: knownPluginNames.length,
                knownConfigKeyCount: knownConfigKeys.length,
                knownConfigKeySample: knownConfigKeys.slice(0, 8),
                assisted: this.errors.map((a: ConfigErrorAssist) => ({
                  hasHint: Boolean(a.hint),
                  hasFix: Boolean(a.fix),
                  fixDescription: a.fix?.description ?? null,
                  line: a.line,
                })),
              },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion
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
.config-page {
  font-family: var(--font-body);
}

.config-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.config-header-left {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.back-link {
  font-size: 0.82rem;
  color: var(--color-text-4);
  text-decoration: none;
  margin-bottom: 0.1rem;
}

.back-link:hover {
  color: var(--color-text-2);
}

.config-title {
  font-size: 1.5rem;
  font-weight: 650;
  color: var(--color-text-1);
  line-height: 1.2;
  text-wrap: balance;
}

.config-subtitle {
  font-size: 0.82rem;
  color: var(--color-text-4);
}

.config-header-right {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding-top: 0.25rem;
}

.shortcut-hint {
  font-size: 0.78rem;
  color: var(--color-text-4);
}

.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.25rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: var(--color-accent);
  color: #fff;
  min-width: 120px;
  justify-content: center;
  font-family: inherit;
}

html.dark .save-btn {
  color: #0c0f14;
}

.save-btn:hover:not(:disabled) {
  filter: brightness(1.06);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.save-btn--saved {
  background: var(--color-success) !important;
  color: #fff !important;
}

.save-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.error-panel {
  background: color-mix(in srgb, var(--color-danger) 10%, var(--color-surface));
  border: 1px solid color-mix(in srgb, var(--color-danger) 30%, transparent);
  border-radius: var(--radius-md);
  padding: 0.875rem 1rem;
  margin-bottom: 1rem;
}

.error-panel-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.error-panel-icon {
  color: var(--color-danger);
  font-size: 0.95rem;
}

.error-panel-title {
  flex: 1;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--color-danger);
}

.error-panel-close {
  background: none;
  border: none;
  color: var(--color-text-3);
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  font-family: inherit;
}

.error-panel-close:hover {
  color: var(--color-text-1);
}

.error-block {
  padding: 0.25rem 0;
}

.error-block + .error-block {
  margin-top: 0.5rem;
  border-top: 1px solid color-mix(in srgb, var(--color-danger) 18%, transparent);
  padding-top: 0.5rem;
}

.error-item {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-danger);
  margin: 0;
  padding: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.error-hint {
  margin: 0.35rem 0 0;
  font-size: 0.8rem;
  color: var(--color-text-3);
  line-height: 1.35;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.4rem;
}

.error-docs-link {
  font-size: 0.78rem;
  color: var(--color-accent);
  text-decoration: none;
}

.error-docs-link:hover {
  text-decoration: underline;
}

.error-goto-line {
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  font-size: 0.78rem;
  color: var(--color-accent);
  cursor: pointer;
}

.error-goto-line:hover {
  text-decoration: underline;
}

.error-fix {
  margin-top: 0.55rem;
  padding-top: 0.45rem;
  border-top: 1px dashed color-mix(in srgb, var(--color-danger) 16%, transparent);
}

.error-fix-desc {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-2);
  line-height: 1.35;
}

.error-fix-preview {
  margin: 0.35rem 0 0;
  padding: 0.4rem 0.55rem;
  max-height: 5.5rem;
  overflow: auto;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  line-height: 1.35;
  color: var(--color-text-3);
  background: color-mix(in srgb, var(--color-surface-2) 80%, transparent);
  border-radius: var(--radius-sm);
  white-space: pre-wrap;
  word-break: break-word;
}

.error-fix-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
  margin-top: 0.45rem;
}

.error-fix-apply,
.error-fix-dismiss {
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  font-size: 0.78rem;
  cursor: pointer;
}

.error-fix-apply {
  color: var(--color-accent);
  font-weight: 500;
}

.error-fix-apply:hover,
.error-fix-dismiss:hover {
  text-decoration: underline;
}

.error-fix-dismiss {
  color: var(--color-text-4);
}

.editor-shell {
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.editor-shell--loading {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
}

.loading-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-text-4);
  font-size: 0.9rem;
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.editor-statusbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.4rem 0.85rem;
  background: var(--color-surface-2);
  border-bottom: 1px solid var(--color-border);
}

.statusbar-lang {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--color-accent);
  background: var(--color-accent-muted);
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
}

.statusbar-hint {
  font-size: 0.75rem;
  color: var(--color-text-4);
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: var(--color-surface-2);
}

.skeleton-line--title {
  width: 200px;
  height: 24px;
  margin-bottom: 1.5rem;
}

.errors-enter-active,
.errors-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.errors-enter-from,
.errors-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
