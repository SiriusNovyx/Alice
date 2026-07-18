import yaml from "js-yaml";
import { GuildPluginData } from "vety";
import { Configs } from "../../../data/Configs.js";
import { loadYamlSafely } from "../../../utils/loadYamlSafely.js";
import { WelcomeMessagePluginType } from "../types.js";

export type WelcomeConfigPatch = Record<string, unknown>;

/**
 * Patch `plugins.welcome_message.config` in the guild YAML, validate, save, and reload.
 * Rewrites the stored YAML (same as a dashboard save).
 */
export async function patchWelcomeConfig(
  pluginData: GuildPluginData<WelcomeMessagePluginType>,
  patch: WelcomeConfigPatch,
  editedBy: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  // Dynamic import avoids: availablePlugins → WelcomeMessage → configValidator → availablePlugins
  const { validateGuildConfig } = await import("../../../configValidator.js");

  const configs = new Configs();
  const key = `guild-${pluginData.guild.id}`;
  const row = await configs.getActiveByKey(key);
  if (!row) {
    return { ok: false, error: "No guild config found. Allowlist this server first." };
  }

  let parsed: Record<string, any>;
  try {
    parsed = loadYamlSafely(row.config);
  } catch (e: any) {
    return { ok: false, error: `Failed to parse guild YAML: ${e?.message ?? e}` };
  }

  if (!parsed.plugins || typeof parsed.plugins !== "object") {
    parsed.plugins = {};
  }
  if (!parsed.plugins.welcome_message || typeof parsed.plugins.welcome_message !== "object") {
    parsed.plugins.welcome_message = { config: {} };
  }
  if (
    !parsed.plugins.welcome_message.config ||
    typeof parsed.plugins.welcome_message.config !== "object"
  ) {
    parsed.plugins.welcome_message.config = {};
  }

  Object.assign(parsed.plugins.welcome_message.config, patch);

  const validationError = await validateGuildConfig(parsed);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const dumped = yaml.dump(parsed, {
    lineWidth: -1,
    noRefs: true,
  });

  await configs.saveNewRevision(key, dumped.endsWith("\n") ? dumped : `${dumped}\n`, editedBy);
  await pluginData.getVetyInstance().reloadGuild(pluginData.guild.id);
  return { ok: true };
}
