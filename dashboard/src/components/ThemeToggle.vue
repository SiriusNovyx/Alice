<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="ariaLabel"
    :title="ariaLabel"
    @click="onToggle"
  >
    <svg v-if="resolved === 'dark'" class="theme-toggle-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3v2M10 15v2M3 10h2M15 10h2M5.05 5.05l1.4 1.4M13.55 13.55l1.4 1.4M5.05 14.95l1.4-1.4M13.55 6.45l1.4-1.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/>
    </svg>
    <svg v-else class="theme-toggle-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M16 11.2A6.2 6.2 0 0 1 8.8 4 6.5 6.5 0 1 0 16 11.2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>
  </button>
</template>

<script lang="ts">
import { cycleTheme, getThemePreference, resolveTheme, type ThemePreference } from "../theme";

export default {
  name: "ThemeToggle",
  data() {
    return {
      preference: getThemePreference() as ThemePreference,
      resolved: resolveTheme() as "light" | "dark",
    };
  },
  computed: {
    ariaLabel(): string {
      const labels: Record<ThemePreference, string> = {
        light: "Theme: light. Click for dark",
        dark: "Theme: dark. Click for system",
        system: "Theme: system. Click for light",
      };
      return labels[this.preference];
    },
  },
  methods: {
    onToggle() {
      this.preference = cycleTheme();
      this.resolved = resolveTheme(this.preference);
    },
  },
};
</script>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-3);
  cursor: pointer;
  flex-shrink: 0;
}

.theme-toggle:hover {
  color: var(--color-text-1);
  border-color: var(--color-border-2);
  background: var(--color-surface-2);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.theme-toggle-icon {
  width: 1rem;
  height: 1rem;
}
</style>
