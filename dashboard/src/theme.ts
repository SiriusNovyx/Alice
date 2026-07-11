export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "alice-theme";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "dark";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return "system";
}

export function resolveTheme(preference: ThemePreference = getThemePreference()): ResolvedTheme {
  return preference === "system" ? getSystemTheme() : preference;
}

export function applyTheme(preference?: ThemePreference): ResolvedTheme {
  const pref = preference ?? getThemePreference();
  const resolved = resolveTheme(pref);
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.classList.toggle("light", resolved === "light");
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
  return resolved;
}

export function setThemePreference(preference: ThemePreference): ResolvedTheme {
  try {
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    /* ignore */
  }
  return applyTheme(preference);
}

/** Cycle light → dark → system → light */
export function cycleTheme(): ThemePreference {
  const order: ThemePreference[] = ["light", "dark", "system"];
  const current = getThemePreference();
  const next = order[(order.indexOf(current) + 1) % order.length];
  setThemePreference(next);
  return next;
}

export function initTheme(): void {
  applyTheme();

  if (typeof window === "undefined" || !window.matchMedia) {
    return;
  }

  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    if (getThemePreference() === "system") {
      applyTheme("system");
    }
  };

  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", onChange);
  } else {
    // Safari < 14
    mq.addListener(onChange);
  }
}
