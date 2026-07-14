import yaml from "js-yaml";

export type ConfigErrorFix = {
  description: string;
  proposedYaml: string;
};

export type ConfigErrorAssist = {
  message: string;
  hint: string | null;
  docsPath: string | null;
  line: number | null;
  fix: ConfigErrorFix | null;
};

type AssistRule = {
  test: RegExp;
  hint: string | ((match: RegExpMatchArray) => string);
  docsPath: string | ((match: RegExpMatchArray) => string);
};

const DOCS_CONFIG_FORMAT = "/docs/configuration/configuration-format";
const DOCS_PLUGIN_CONFIG = "/docs/configuration/plugin-configuration";
const DOCS_PERMISSIONS = "/docs/configuration/permissions";

const YAML_DUMP_OPTS = {
  lineWidth: 120,
  quotingType: '"' as const,
  forceQuotes: false,
  noRefs: true,
};

const RULES: AssistRule[] = [
  {
    test: /Object aliases are not allowed/i,
    hint: "Remove YAML & anchors / * aliases; paste plain structure",
    docsPath: DOCS_CONFIG_FORMAT,
  },
  {
    test: /Unknown plugin:\s*(\S+)/i,
    hint: "Check spelling; plugin key must match docs name",
    docsPath: (m) => `/docs/plugins/${m[1]}`,
  },
  {
    test: /Invalid options specified for plugin/i,
    hint: "Plugin value must be a mapping with config / overrides",
    docsPath: DOCS_PLUGIN_CONFIG,
  },
  {
    test: /(?:at\s+line\s+(\d+)|line\s+(\d+)|\((\d+):\d+\))/i,
    hint: "Fix syntax near that line (indent, quotes, duplicate keys)",
    docsPath: DOCS_CONFIG_FORMAT,
  },
  {
    test: /(?:^|\n)levels\/|Invalid snowflake ID/i,
    hint: "Level keys must be role/user snowflake strings",
    docsPath: DOCS_PERMISSIONS,
  },
  {
    test: /[Uu]nrecognized key/,
    hint: "Remove or rename the key; schemas are strict",
    docsPath: DOCS_PLUGIN_CONFIG,
  },
  {
    test: /Invalid input|Expected |invalid_type/i,
    hint: "Wrong type at that path (string vs number vs bool/object)",
    docsPath: DOCS_PLUGIN_CONFIG,
  },
  {
    test: /^([a-z][a-z0-9_]*(?:_[a-z0-9_]+)*):/i,
    hint: "See that plugin’s docs for valid config / overrides",
    docsPath: (m) => `/docs/plugins/${m[1]}`,
  },
];

function extractLine(raw: string): number | null {
  const patterns = [
    /\bat\s+line\s+(\d+)\b/i,
    /\bline\s+(\d+)\b/i,
    /\((\d+):\d+\)/,
  ];
  for (const re of patterns) {
    const m = raw.match(re);
    if (m) {
      const n = parseInt(m[1], 10);
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return null;
}

function dumpYaml(doc: unknown): string {
  const out = yaml.dump(doc, YAML_DUMP_OPTS);
  return out.endsWith("\n") ? out : out + "\n";
}

function loadYamlObject(yamlText: string): Record<string, unknown> | null {
  try {
    const loaded = yaml.load(yamlText);
    if (loaded == null || typeof loaded !== "object" || Array.isArray(loaded)) {
      return null;
    }
    return loaded as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getAtPath(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const key of path) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

function setAtPath(obj: Record<string, unknown>, path: string[], value: unknown): boolean {
  if (path.length === 0) return false;
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    const next = cur[key];
    if (next == null || typeof next !== "object" || Array.isArray(next)) return false;
    cur = next as Record<string, unknown>;
  }
  cur[path[path.length - 1]] = value;
  return true;
}

function deleteAtPath(obj: Record<string, unknown>, path: string[]): boolean {
  if (path.length === 0) return false;
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    const next = cur[key];
    if (next == null || typeof next !== "object" || Array.isArray(next)) return false;
    cur = next as Record<string, unknown>;
  }
  const last = path[path.length - 1];
  if (!(last in cur)) return false;
  delete cur[last];
  return true;
}

function renamePluginKey(
  obj: Record<string, unknown>,
  from: string,
  to: string,
): boolean {
  const plugins = obj.plugins;
  if (plugins == null || typeof plugins !== "object" || Array.isArray(plugins)) {
    return false;
  }
  const map = plugins as Record<string, unknown>;
  if (!(from in map) || from === to || to in map) return false;
  map[to] = map[from];
  delete map[from];
  return true;
}

function normalizePluginName(name: string): string {
  return name.toLowerCase().replace(/-/g, "_");
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const prev = new Array<number>(b.length + 1);
  const cur = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = cur[j];
  }
  return prev[b.length];
}

/** Exported for tests — pick a single clear close match or null. */
export function findBestPluginMatch(
  unknown: string,
  knownPluginNames: string[],
): string | null {
  if (!unknown || !knownPluginNames.length) return null;
  if (knownPluginNames.includes(unknown)) return null;

  const u = normalizePluginName(unknown);
  const uCompact = u.replace(/_/g, "");

  for (const known of knownPluginNames) {
    if (normalizePluginName(known) === u && known !== unknown) {
      return known;
    }
  }

  type Candidate = { name: string; dist: number };
  const scored: Candidate[] = [];

  for (const known of knownPluginNames) {
    const n = normalizePluginName(known);
    const nCompact = n.replace(/_/g, "");
    let dist = Math.min(levenshtein(u, n), levenshtein(uCompact, nCompact));
    if (n.includes(u) || u.includes(n) || nCompact.includes(uCompact) || uCompact.includes(nCompact)) {
      const lenGap = Math.abs(nCompact.length - uCompact.length);
      dist = Math.min(dist, lenGap <= 2 ? lenGap : dist);
    }
    scored.push({ name: known, dist });
  }

  scored.sort((a, b) => a.dist - b.dist || a.name.localeCompare(b.name));
  const best = scored[0];
  if (!best) return null;

  const maxDist = best.name.length <= 4 ? 1 : 2;
  if (best.dist > maxDist) return null;
  if (scored.length > 1 && scored[1].dist === best.dist) return null;
  return best.name;
}

/**
 * Quote bare numeric snowflake-like keys under `levels:` in the source YAML.
 * Uses string surgery so digit precision is preserved (js-yaml would round them).
 */
function fixLevelsSnowflakeQuoting(yamlText: string): ConfigErrorFix | null {
  const newline = yamlText.includes("\r\n") ? "\r\n" : "\n";
  const lines = yamlText.split(/\r?\n/);
  let inLevels = false;
  let levelsIndent = -1;
  let changed = 0;

  const out = lines.map((line) => {
    const levelsHeader = line.match(/^(\s*)levels:\s*(?:#.*)?$/);
    if (levelsHeader) {
      inLevels = true;
      levelsIndent = levelsHeader[1].length;
      return line;
    }

    if (!inLevels) return line;

    if (line.trim() === "" || /^\s*#/.test(line)) return line;

    const indent = (line.match(/^(\s*)/)?.[1].length) ?? 0;
    if (indent <= levelsIndent) {
      inLevels = false;
      return line;
    }

    // Bare 16–20 digit key (Discord snowflake range), not already quoted
    const keyMatch = line.match(/^(\s+)(\d{16,20})(\s*:)(.*)$/);
    if (keyMatch) {
      changed++;
      return `${keyMatch[1]}"${keyMatch[2]}"${keyMatch[3]}${keyMatch[4]}`;
    }
    return line;
  });

  if (!changed) return null;
  return {
    description:
      changed === 1
        ? 'Quote bare numeric levels key as a snowflake string'
        : `Quote ${changed} bare numeric levels keys as snowflake strings`,
    proposedYaml: out.join(newline),
  };
}

function fixUnknownPluginRename(
  message: string,
  yamlText: string,
  knownPluginNames: string[] | null | undefined,
): ConfigErrorFix | null {
  const m = message.match(/Unknown plugin:\s*(\S+)/i);
  if (!m || !knownPluginNames?.length) return null;

  const unknown = m[1].replace(/[,:;]+$/, "");
  const match = findBestPluginMatch(unknown, knownPluginNames);
  if (!match) return null;

  const doc = loadYamlObject(yamlText);
  if (!doc) return null;
  if (!renamePluginKey(doc, unknown, match)) return null;

  return {
    description: `Did you mean "${match}"? Rename unknown plugin "${unknown}" → "${match}"`,
    proposedYaml: dumpYaml(doc),
  };
}

function fixInvalidPluginOptionsWrapper(
  message: string,
  yamlText: string,
): ConfigErrorFix | null {
  const m = message.match(/Invalid options specified for plugin\s+(\S+)/i);
  if (!m) return null;
  const pluginName = m[1].replace(/[,:;]+$/, "");

  const doc = loadYamlObject(yamlText);
  if (!doc) return null;
  const plugins = doc.plugins;
  if (plugins == null || typeof plugins !== "object" || Array.isArray(plugins)) {
    return null;
  }
  const map = plugins as Record<string, unknown>;
  if (!(pluginName in map)) return null;

  const current = map[pluginName];
  // Only wrap non-object / null values (matches backend check)
  if (current != null && typeof current === "object") return null;

  if (current === undefined) {
    map[pluginName] = { config: {} };
  } else {
    // Scalar/null → empty config wrapper (do not invent meaning for the scalar)
    map[pluginName] = { config: {} };
  }

  return {
    description: `Wrap plugins.${pluginName} in { config: {} }`,
    proposedYaml: dumpYaml(doc),
  };
}

function parsePluginPrefix(message: string): string | null {
  const m = message.match(/^([a-z][a-z0-9_]*(?:_[a-z0-9_]+)*)\s*:/i);
  return m ? m[1] : null;
}

function parsePrettifyAtPath(message: string): string[] {
  const m = message.match(/→\s*at\s+([^\n\r]+)/);
  if (!m) return [];
  return m[1]
    .trim()
    .split(".")
    .map((p) => p.trim())
    .filter(Boolean);
}

function parseSlashPathPrefix(message: string): string[] {
  // formatZodIssue: path/to/parent: Unrecognized key...
  const m = message.match(/^([A-Za-z0-9_./-]+):\s*[Uu]nrecognized key/);
  if (!m) return [];
  const raw = m[1];
  if (!raw) return [];
  return raw.split("/").filter(Boolean);
}

function extractUnrecognizedKeys(message: string): string[] {
  const keys: string[] = [];
  const re = /[Uu]nrecognized keys?:\s*((?:"[^"]+"\s*,?\s*)+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(message)) !== null) {
    const inner = match[1];
    for (const km of inner.matchAll(/"([^"]+)"/g)) {
      keys.push(km[1]);
    }
  }
  // Zod JSON issue: "keys": [ "panic_ymode" ]
  for (const m of message.matchAll(/"keys"\s*:\s*\[([^\]]*)\]/g)) {
    for (const km of m[1].matchAll(/"([^"]+)"/g)) {
      keys.push(km[1]);
    }
  }
  return [...new Set(keys)];
}

/** Top-level guild config keys from zAliceGuildConfig (strictObject). */
const KNOWN_ROOT_KEYS = ["prefix", "levels", "plugins"];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Rename a root-level YAML key via string surgery (preserves the rest of the file).
 * Returns null if from is missing or to already exists at root.
 */
function renameRootYamlKey(
  yamlText: string,
  from: string,
  to: string,
): string | null {
  if (!from || !to || from === to) return null;
  const toRe = new RegExp(`^${escapeRegExp(to)}\\s*:`, "m");
  if (toRe.test(yamlText)) return null;
  const fromRe = new RegExp(`^${escapeRegExp(from)}(\\s*:)`, "m");
  if (!fromRe.test(yamlText)) return null;
  return yamlText.replace(fromRe, `${to}$1`);
}

function renameKeyAtPath(
  obj: Record<string, unknown>,
  parentPath: string[],
  from: string,
  to: string,
): boolean {
  const parent =
    parentPath.length === 0 ? obj : (getAtPath(obj, parentPath) as Record<string, unknown> | undefined);
  if (parent == null || typeof parent !== "object" || Array.isArray(parent)) {
    return false;
  }
  if (!(from in parent) || from === to || to in parent) return false;
  parent[to] = parent[from];
  delete parent[from];
  return true;
}

function knownKeysAtParent(
  parentPath: string[],
  doc: Record<string, unknown>,
  knownPluginNames?: string[] | null,
  knownConfigKeys?: string[] | null,
): string[] {
  if (parentPath.length === 0) return KNOWN_ROOT_KEYS;
  if (parentPath.length === 1 && parentPath[0] === "plugins") {
    return knownPluginNames?.length ? [...knownPluginNames] : [];
  }
  const fromDoc: string[] = [];
  const parent = getAtPath(doc, parentPath);
  if (parent != null && typeof parent === "object" && !Array.isArray(parent)) {
    fromDoc.push(...Object.keys(parent as object));
  }
  // Plugin config schemas: prefer docs defaultOptions keys for Did-you-mean
  if (
    knownConfigKeys?.length &&
    parentPath[0] === "plugins" &&
    parentPath[2] === "config"
  ) {
    return [...new Set([...knownConfigKeys, ...fromDoc])];
  }
  return fromDoc;
}

function renameYamlKeyAnywhere(
  yamlText: string,
  from: string,
  to: string,
): string | null {
  if (!from || !to || from === to) return null;
  const newline = yamlText.includes("\r\n") ? "\r\n" : "\n";
  const lines = yamlText.split(/\r?\n/);
  let changed = 0;
  const fromRe = new RegExp(`^(\\s*)${escapeRegExp(from)}(\\s*:)`);
  const out = lines.map((line) => {
    const m = line.match(fromRe);
    if (!m) return line;
    // Avoid renaming if a same-indent `to:` already exists nearby — still allow
    changed++;
    return `${m[1]}${to}${m[2]}${line.slice(m[0].length)}`;
  });
  if (!changed) return null;
  return out.join(newline);
}

function collectObjectKeys(value: unknown, out: Set<string> = new Set()): string[] {
  if (value == null || typeof value !== "object") return [...out];
  if (Array.isArray(value)) {
    for (const item of value) collectObjectKeys(item, out);
    return [...out];
  }
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out.add(k);
    collectObjectKeys(v, out);
  }
  return [...out];
}

/**
 * Prefer "Did you mean …?" rename for unrecognized keys; delete only as last resort.
 */
function fixUnrecognizedKey(
  message: string,
  yamlText: string,
  knownPluginNames?: string[] | null,
  knownConfigKeys?: string[] | null,
): ConfigErrorFix | null {
  if (!/[Uu]nrecognized key/i.test(message) && !/"code"\s*:\s*"unrecognized_keys"/i.test(message)) {
    return null;
  }

  let keys = extractUnrecognizedKeys(message);
  const pluginPrefix = parsePluginPrefix(message);
  const atPath = parsePrettifyAtPath(message);
  const slashPath = parseSlashPathPrefix(message);
  const jsonIssues = parsePluginZodJsonIssues(message);

  let parentPath: string[] = [];
  let wrapperPath: string[] | null = null;
  if (jsonIssues) {
    const issue =
      jsonIssues.issues.find(
        (i) =>
          i.code === "unrecognized_keys" ||
          /unrecognized key/i.test(String(i.message || "")),
      ) || jsonIssues.issues[0];
    if (issue?.keys?.length) {
      keys = [...new Set([...keys, ...issue.keys.map(String)])];
    }
    const issuePath = (issue?.path || []).map(String).filter(Boolean);
    if (issuePath.length === 0) {
      // Top-level plugin option typo (e.g. overjrides) OR config key typo
      wrapperPath = ["plugins", jsonIssues.plugin];
      parentPath = ["plugins", jsonIssues.plugin, "config"];
    } else {
      parentPath = ["plugins", jsonIssues.plugin, "config", ...issuePath];
    }
  } else if (atPath.length || (pluginPrefix && /✖/.test(message))) {
    parentPath = pluginPrefix ? ["plugins", pluginPrefix, "config", ...atPath] : atPath;
  } else if (slashPath.length) {
    parentPath = slashPath;
  } else if (pluginPrefix) {
    parentPath = ["plugins", pluginPrefix, "config"];
  }

  if (!keys.length) return null;

  const PLUGIN_WRAPPER_KEYS = ["config", "overrides"];

  // Single unrecognized key → try fuzzy rename first ("Did you mean…?")
  if (keys.length === 1) {
    const badKey = keys[0];
    const docForLookup = loadYamlObject(yamlText);
    if (docForLookup) {
      const attempts: { path: string[]; candidates: string[] }[] = [];
      if (wrapperPath) {
        attempts.push({ path: wrapperPath, candidates: PLUGIN_WRAPPER_KEYS });
      }
      const known = knownKeysAtParent(
        parentPath,
        docForLookup,
        knownPluginNames,
        knownConfigKeys,
      );
      attempts.push({
        path: parentPath,
        candidates: known.filter((k) => k !== badKey),
      });

      // Also collect nested keys under the plugin for trigger-type typos etc.
      if (parentPath[0] === "plugins" && parentPath[1]) {
        const pluginObj = getAtPath(docForLookup, ["plugins", parentPath[1]]);
        const nestedKeys = collectObjectKeys(pluginObj);
        attempts.push({
          path: parentPath,
          candidates: nestedKeys.filter((k) => k !== badKey),
        });
      }

      for (const attempt of attempts) {
        const suggestion = findBestPluginMatch(badKey, attempt.candidates);
        if (!suggestion) continue;
        if (attempt.path.length === 0) {
          const proposed = renameRootYamlKey(yamlText, badKey, suggestion);
          if (proposed != null && proposed !== yamlText) {
            return {
              description: `Did you mean "${suggestion}"? Rename "${badKey}" → "${suggestion}"`,
              proposedYaml: proposed.endsWith("\n") ? proposed : proposed + "\n",
            };
          }
        } else {
          const proposed = renameYamlKeyAnywhere(yamlText, badKey, suggestion);
          if (proposed != null && proposed !== yamlText) {
            return {
              description: `Did you mean "${suggestion}"? Rename "${badKey}" → "${suggestion}"`,
              proposedYaml: proposed.endsWith("\n") ? proposed : proposed + "\n",
            };
          }
          const docClone = loadYamlObject(yamlText);
          if (
            docClone &&
            renameKeyAtPath(docClone, attempt.path, badKey, suggestion)
          ) {
            return {
              description: `Did you mean "${suggestion}"? Rename "${badKey}" → "${suggestion}"`,
              proposedYaml: dumpYaml(docClone),
            };
          }
        }
      }
    }
  }

  // Last resort: remove unrecognized key(s) — try config path then plugin root
  const doc = loadYamlObject(yamlText);
  if (!doc) return null;

  const pathAttempts = [parentPath];
  if (parentPath[2] === "config") {
    pathAttempts.push(parentPath.filter((_, i) => i !== 2));
  }

  const removed: string[] = [];
  for (const key of keys) {
    let deleted = false;
    for (const base of pathAttempts) {
      const fullPath = [...base, key];
      if (deleteAtPath(doc, fullPath)) {
        removed.push(fullPath.join(".") || key);
        deleted = true;
        break;
      }
    }
    if (!deleted) {
      // String-surgery delete of a single-line key (keeps nested block orphaned risk —
      // only for scalar-looking lines). Nested maps still need tree delete.
      void deleted;
    }
  }

  if (!removed.length) return null;

  return {
    description:
      removed.length === 1
        ? `Remove unrecognized key "${removed[0]}" (no close match to rename)`
        : `Remove unrecognized keys: ${removed.join(", ")} (no close match to rename)`,
    proposedYaml: dumpYaml(doc),
  };
}

function parseExpectedType(message: string): {
  expected: "number" | "string" | "boolean";
  path: string[];
  received?: string;
} | null {
  // Plugin ZodError serialized as JSON issue list:
  // booster_roles: [ { "expected": "string", "path": ["booster_role_id"], "message": "..." } ]
  const jsonIssues = parsePluginZodJsonIssues(message);
  if (jsonIssues) {
    for (const issue of jsonIssues.issues) {
      const expectedRaw = String(issue.expected || "").toLowerCase();
      if (!["number", "string", "boolean"].includes(expectedRaw)) continue;
      const pathTail = (issue.path || []).map(String).filter(Boolean);
      if (!pathTail.length) continue;
      const receivedMatch = String(issue.message || "").match(/received\s+(\w+)/i);
      return {
        expected: expectedRaw as "number" | "string" | "boolean",
        path: ["plugins", jsonIssues.plugin, "config", ...pathTail],
        received: receivedMatch?.[1]?.toLowerCase(),
      };
    }
  }

  const expectedMatch = message.match(
    /(?:Invalid input:\s*)?[Ee]xpected\s+(number|string|boolean)\b(?:.*?received\s+(\w+))?/i,
  );
  if (!expectedMatch) return null;
  const expected = expectedMatch[1].toLowerCase() as "number" | "string" | "boolean";
  const received = expectedMatch[2]?.toLowerCase();

  const pluginPrefix = parsePluginPrefix(message);
  const atPath = parsePrettifyAtPath(message);
  let path: string[] = [];

  if (atPath.length) {
    path = pluginPrefix ? ["plugins", pluginPrefix, "config", ...atPath] : atPath;
  } else {
    // formatZodIssue: plugins/foo/config/count: Invalid input: expected number...
    const slash = message.match(
      /^([A-Za-z0-9_./-]+):\s*(?:Invalid input:\s*)?[Ee]xpected\s+(?:number|string|boolean)/i,
    );
    if (slash) {
      path = slash[1].split("/").filter(Boolean);
    }
  }

  if (!path.length) return null;
  return { expected, path, received };
}

type ZodJsonIssue = {
  expected?: string;
  code?: string;
  path?: Array<string | number>;
  message?: string;
  keys?: string[];
};

function parsePluginZodJsonIssues(
  message: string,
): { plugin: string; issues: ZodJsonIssue[] } | null {
  // Normal: "mod_actions: [ {...} ]"
  // Override: "censor: Invalid override config: [ {...} ]"
  const m = message.match(
    /^([a-z][a-z0-9_]*(?:_[a-z0-9_]+)*)\s*:(?:\s*Invalid override config:)?\s*(\[[\s\S]*\])\s*$/i,
  );
  if (!m) return null;
  try {
    const issues = JSON.parse(m[2]) as unknown;
    if (!Array.isArray(issues) || !issues.length) return null;
    return { plugin: m[1], issues: issues as ZodJsonIssue[] };
  } catch {
    return null;
  }
}

/**
 * Quote bare numeric snowflake *values* (not keys) via string surgery.
 * yaml.load would already have lost precision for IDs > Number.MAX_SAFE_INTEGER.
 */
function quoteBareSnowflakeValueForKey(
  yamlText: string,
  key: string,
): ConfigErrorFix | null {
  if (!key) return null;
  const newline = yamlText.includes("\r\n") ? "\r\n" : "\n";
  const lines = yamlText.split(/\r?\n/);
  const keyRe = new RegExp(
    `^(\\s*)${escapeRegExp(key)}:\\s*(\\d{16,20})(\\s*(?:#.*)?)?$`,
  );
  let changed = 0;
  const out = lines.map((line) => {
    const m = line.match(keyRe);
    if (!m) return line;
    changed++;
    const comment = (m[3] || "").trim();
    return `${m[1]}${key}: "${m[2]}"${comment ? ` ${comment}` : ""}`;
  });
  if (!changed) return null;
  return {
    description: `Quote ${key} snowflake value as a string`,
    proposedYaml: out.join(newline),
  };
}

/** Quote bare snowflake list items under `key:` (e.g. `- 123456789012345678`). */
function quoteBareSnowflakeListItems(
  yamlText: string,
  listKey: string,
): ConfigErrorFix | null {
  if (!listKey) return null;
  const newline = yamlText.includes("\r\n") ? "\r\n" : "\n";
  const lines = yamlText.split(/\r?\n/);
  let inList = false;
  let baseIndent = -1;
  let changed = 0;

  const out = lines.map((line) => {
    // Flow style: key: [123, 456] or key: [123]
    const flow = line.match(
      new RegExp(
        `^(\\s*)${escapeRegExp(listKey)}:\\s*\\[([^\\]]*)\\](\\s*(?:#.*)?)?$`,
      ),
    );
    if (flow) {
      const inner = flow[2];
      if (!/\d{16,20}/.test(inner)) return line;
      const quotedInner = inner.replace(
        /(^|[\s,]+)(\d{16,20})(?=[\s,\]]|$)/g,
        (all, pre, id) => `${pre}"${id}"`,
      );
      if (quotedInner === inner) return line;
      changed++;
      const comment = (flow[3] || "").trim();
      return `${flow[1]}${listKey}: [${quotedInner}]${comment ? ` ${comment}` : ""}`;
    }

    const header = line.match(
      new RegExp(`^(\\s*)${escapeRegExp(listKey)}:\\s*(?:\\[\\s*\\])?\\s*(?:#.*)?$`),
    );
    if (header) {
      inList = true;
      baseIndent = header[1].length;
      return line;
    }
    if (!inList) return line;
    if (line.trim() === "" || /^\s*#/.test(line)) return line;

    const indent = (line.match(/^(\s*)/)?.[1].length) ?? 0;
    if (indent <= baseIndent) {
      inList = false;
      return line;
    }

    const item = line.match(/^(\s*-\s+)(\d{16,20})(\s*(?:#.*)?)?$/);
    if (item) {
      changed++;
      const comment = (item[3] || "").trim();
      return `${item[1]}"${item[2]}"${comment ? ` ${comment}` : ""}`;
    }
    return line;
  });

  if (!changed) return null;
  return {
    description:
      changed === 1
        ? `Quote snowflake list item under ${listKey} as a string`
        : `Quote ${changed} snowflake values under ${listKey} as strings`,
    proposedYaml: out.join(newline),
  };
}

/** When a *_ids field is a bare snowflake number instead of an array. */
function wrapSnowflakeScalarAsArray(
  yamlText: string,
  key: string,
): ConfigErrorFix | null {
  const newline = yamlText.includes("\r\n") ? "\r\n" : "\n";
  const lines = yamlText.split(/\r?\n/);
  let changed = 0;
  const out = lines.map((line) => {
    // Preserve trailing comment + spacing: key: 123    # REPLACE
    const m = line.match(
      new RegExp(
        `^(\\s*)${escapeRegExp(key)}:\\s*(\\d{16,20})(\\s*#.*)?$`,
      ),
    );
    if (!m) return line;
    changed++;
    const comment = m[3] ?? "";
    // Prefer flow style to match common Alice configs: key: ["id"]
    return `${m[1]}${key}: ["${m[2]}"]${comment}`;
  });
  if (!changed) return null;
  return {
    description: `Wrap ${key} as a quoted string array (flow style)`,
    proposedYaml: out.join(newline),
  };
}

function fixUnquotedSnowflakeValues(
  message: string,
  yamlText: string,
): ConfigErrorFix | null {
  const looksLike =
    /expected\s+string/i.test(message) &&
    (/received\s+number/i.test(message) || /"expected"\s*:\s*"string"/i.test(message));
  if (!looksLike) return null;

  type Target = { key: string; list: boolean };
  const targets: Target[] = [];

  const jsonIssues = parsePluginZodJsonIssues(message);
  if (jsonIssues) {
    for (const issue of jsonIssues.issues) {
      const expected = String(issue.expected || "").toLowerCase();
      const msg = String(issue.message || "");
      if (expected !== "string" && !/expected\s+string/i.test(msg)) continue;
      if (!/received\s+number/i.test(msg) && issue.code !== "invalid_type") continue;
      const path = issue.path || [];
      if (!path.length) continue;
      const last = path[path.length - 1];
      const list = typeof last === "number" || /^\d+$/.test(String(last));
      const key = list ? String(path[path.length - 2] ?? "") : String(last);
      if (key) targets.push({ key, list });
    }
  }

  if (!targets.length) {
    for (const m of message.matchAll(
      /"path"\s*:\s*\[\s*((?:"[^"]+"\s*,?\s*|\d+\s*,?\s*)+)\]/g,
    )) {
      const parts = [...m[1].matchAll(/"([^"]+)"|(\d+)/g)].map((p) => p[1] ?? p[2]);
      if (!parts.length) continue;
      const last = parts[parts.length - 1];
      const list = /^\d+$/.test(last);
      const key = list ? parts[parts.length - 2] : last;
      if (key) targets.push({ key, list });
    }
  }

  const unique = new Map<string, Target>();
  for (const t of targets) {
    unique.set(`${t.list ? "list" : "scalar"}:${t.key}`, t);
  }
  if (!unique.size) return null;

  let current = yamlText;
  const quoted: string[] = [];
  for (const t of unique.values()) {
    const fix = t.list
      ? quoteBareSnowflakeListItems(current, t.key)
      : quoteBareSnowflakeValueForKey(current, t.key);
    if (!fix) continue;
    current = fix.proposedYaml;
    quoted.push(t.list ? `${t.key}[]` : t.key);
  }
  if (!quoted.length || current === yamlText) return null;

  return {
    description:
      quoted.length === 1
        ? `Did you mean quoted snowflake(s) for ${quoted[0]}? Unquoted YAML numbers lose precision`
        : `Quote snowflake values as strings for ${quoted.join(", ")}`,
    proposedYaml: current.endsWith("\n") ? current : current + "\n",
  };
}

function fixSnowflakeArrayShape(
  message: string,
  yamlText: string,
): ConfigErrorFix | null {
  // staff_role_ids: 123...  when schema expects string[]
  if (!/expected\s+array/i.test(message) || !/received\s+number/i.test(message)) {
    return null;
  }
  const jsonIssues = parsePluginZodJsonIssues(message);
  const keys: string[] = [];
  if (jsonIssues) {
    for (const issue of jsonIssues.issues) {
      if (String(issue.expected || "").toLowerCase() !== "array") continue;
      const path = issue.path || [];
      const last = path[path.length - 1];
      if (last != null && typeof last !== "number") keys.push(String(last));
    }
  }
  for (const key of [...new Set(keys)]) {
    const fix = wrapSnowflakeScalarAsArray(yamlText, key);
    if (fix) return fix;
  }
  return null;
}

function coerceKeyScalarInYaml(
  yamlText: string,
  key: string,
  expected: "number" | "boolean",
): ConfigErrorFix | null {
  const newline = yamlText.includes("\r\n") ? "\r\n" : "\n";
  const lines = yamlText.split(/\r?\n/);
  let changed = 0;
  const out = lines.map((line) => {
    if (expected === "boolean") {
      const m = line.match(
        new RegExp(
          `^(\\s*)${escapeRegExp(key)}:\\s*["'](true|false|yes|no|1|0)["'](\\s*(?:#.*)?)?$`,
          "i",
        ),
      );
      if (!m) return line;
      const raw = m[2].toLowerCase();
      const asBool =
        raw === "true" || raw === "yes" || raw === "1" ? "true" : "false";
      changed++;
      const comment = (m[3] || "").trim();
      return `${m[1]}${key}: ${asBool}${comment ? ` ${comment}` : ""}`;
    }
    const m = line.match(
      new RegExp(
        `^(\\s*)${escapeRegExp(key)}:\\s*["'](-?\\d+(?:\\.\\d+)?)["'](\\s*(?:#.*)?)?$`,
      ),
    );
    if (!m) return line;
    changed++;
    const comment = (m[3] || "").trim();
    return `${m[1]}${key}: ${m[2]}${comment ? ` ${comment}` : ""}`;
  });
  if (!changed) return null;
  return {
    description: `Coerce ${key} to ${expected}`,
    proposedYaml: out.join(newline),
  };
}

function coerceValue(
  value: unknown,
  expected: "number" | "string" | "boolean",
): unknown | typeof COERCE_SKIP {
  if (expected === "number") {
    if (typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value.trim())) {
      const n = Number(value.trim());
      if (Number.isFinite(n)) return n;
    }
    return COERCE_SKIP;
  }
  if (expected === "boolean") {
    if (typeof value === "string") {
      const t = value.trim().toLowerCase();
      if (t === "true") return true;
      if (t === "false") return false;
    }
    if (value === 1) return true;
    if (value === 0) return false;
    return COERCE_SKIP;
  }
  if (expected === "string") {
    if (typeof value === "number" && Number.isFinite(value)) {
      if (Math.abs(value) >= 1e15) return COERCE_SKIP;
      return String(value);
    }
    if (typeof value === "boolean") return value ? "true" : "false";
    return COERCE_SKIP;
  }
  return COERCE_SKIP;
}

const COERCE_SKIP = Symbol("coerce-skip");

function fixTypeCoercion(message: string, yamlText: string): ConfigErrorFix | null {
  if (!/Invalid input|[Ee]xpected\s+(number|string|boolean)|"expected"\s*:/i.test(message)) {
    return null;
  }

  const parsed = parseExpectedType(message);
  if (!parsed) return null;

  // Prefer string surgery for boolean/number — preserves file formatting
  if (parsed.expected === "boolean" || parsed.expected === "number") {
    const key = parsed.path[parsed.path.length - 1];
    if (key && !/^\d+$/.test(key)) {
      const surgical = coerceKeyScalarInYaml(yamlText, key, parsed.expected);
      if (surgical) return surgical;
    }
  }

  const doc = loadYamlObject(yamlText);
  if (!doc) return null;

  const pathCandidates = [parsed.path];
  if (parsed.path[0] === "plugins" && parsed.path[2] === "config") {
    pathCandidates.push([...parsed.path.slice(0, 2), ...parsed.path.slice(3)]);
  }

  for (const path of pathCandidates) {
    const current = getAtPath(doc, path);
    if (current === undefined) continue;

    const coerced = coerceValue(current, parsed.expected);
    if (coerced === COERCE_SKIP) continue;
    if (Object.is(coerced, current)) continue;

    const clone = loadYamlObject(yamlText);
    if (!clone) continue;
    if (!setAtPath(clone, path, coerced)) continue;

    return {
      description: `Coerce ${path.join(".")} to ${parsed.expected}`,
      proposedYaml: dumpYaml(clone),
    };
  }

  return null;
}

/**
 * Propose a single surgical YAML fix for a config validation error, or null.
 * First successful fixer wins.
 */
export function proposeConfigFix(
  rawError: string,
  yamlText: string,
  knownPluginNames?: string[] | null,
  knownConfigKeys?: string[] | null,
): ConfigErrorFix | null {
  const message = typeof rawError === "string" ? rawError : String(rawError);
  if (!yamlText) return null;

  let matchedFixer: string | null = null;
  let result: ConfigErrorFix | null = null;

  if (/(?:^|\n)levels\/|Invalid snowflake ID/i.test(message)) {
    const fix = fixLevelsSnowflakeQuoting(yamlText);
    if (fix) {
      matchedFixer = "levelsSnowflake";
      result = fix;
    }
  }

  if (!result && /Unknown plugin:/i.test(message)) {
    const fix = fixUnknownPluginRename(message, yamlText, knownPluginNames);
    if (fix) {
      matchedFixer = "unknownPluginRename";
      result = fix;
    } else {
      matchedFixer = "unknownPluginRename_miss";
    }
  }

  if (!result && /Invalid options specified for plugin/i.test(message)) {
    const fix = fixInvalidPluginOptionsWrapper(message, yamlText);
    if (fix) {
      matchedFixer = "invalidOptionsWrapper";
      result = fix;
    }
  }

  if (!result && (/[Uu]nrecognized key/i.test(message) || /"unrecognized_keys"/i.test(message))) {
    const fix = fixUnrecognizedKey(message, yamlText, knownPluginNames, knownConfigKeys);
    if (fix) {
      matchedFixer = fix.description.startsWith("Did you mean")
        ? "unrecognizedKeyRename"
        : "unrecognizedKeyRemove";
      result = fix;
    }
  }

  if (!result && /Invalid input|[Ee]xpected\s+(number|string|boolean|array)|"expected"\s*:/i.test(message)) {
    const snowFix = fixUnquotedSnowflakeValues(message, yamlText);
    if (snowFix) {
      matchedFixer = "snowflakeValueQuote";
      result = snowFix;
    } else {
      const arrFix = fixSnowflakeArrayShape(message, yamlText);
      if (arrFix) {
        matchedFixer = "snowflakeArrayWrap";
        result = arrFix;
      } else {
        const fix = fixTypeCoercion(message, yamlText);
        if (fix) {
          matchedFixer = "typeCoercion";
          result = fix;
        }
      }
    }
  }

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
      location: "configErrorAssist.ts:proposeConfigFix",
      message: "proposeConfigFix result",
      data: {
        matchedFixer,
        hasFix: Boolean(result),
        fixDescription: result?.description ?? null,
        errorPreview: message.slice(0, 160),
        yamlLen: yamlText.length,
        knownPluginCount: knownPluginNames?.length ?? 0,
        knownConfigKeyCount: knownConfigKeys?.length ?? 0,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return result;
}

export function assistConfigError(
  raw: string,
  yamlText?: string | null,
  knownPluginNames?: string[] | null,
  knownConfigKeys?: string[] | null,
): ConfigErrorAssist {
  const message = typeof raw === "string" ? raw : String(raw);
  const line = extractLine(message);

  let hint: string | null = null;
  let docsPath: string | null = DOCS_CONFIG_FORMAT;

  for (const rule of RULES) {
    const match = message.match(rule.test);
    if (!match) continue;

    hint = typeof rule.hint === "function" ? rule.hint(match) : rule.hint;
    docsPath =
      typeof rule.docsPath === "function" ? rule.docsPath(match) : rule.docsPath;
    break;
  }

  if (hint == null) {
    docsPath = DOCS_CONFIG_FORMAT;
  }

  const fix =
    yamlText != null && yamlText !== ""
      ? proposeConfigFix(message, yamlText, knownPluginNames, knownConfigKeys)
      : null;

  return { message, hint, docsPath, line, fix };
}
