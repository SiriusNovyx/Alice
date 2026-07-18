import { Guild } from "discord.js";
import { GuildPluginData } from "vety";
import { BotProfileConfig } from "../../../data/entities/BotProfileConfig.js";
import { logger } from "../../../logger.js";
import { BotProfilePluginType } from "../types.js";
import { fetchImageBuffer } from "./fetchImageBuffer.js";

export type ApplyProfileOptions = {
  /** When true, clear nick/avatar/banner/bio on Discord even if DB row is empty. */
  reset?: boolean;
};

/**
 * Apply stored (or reset) per-guild bot profile via `guild.members.editMe`.
 * Banner is only applied when `guild.premiumTier >= 2`.
 */
export async function applyBotProfile(
  pluginData: GuildPluginData<BotProfilePluginType>,
  config: BotProfileConfig | null,
  options: ApplyProfileOptions = {},
): Promise<void> {
  const guild = pluginData.guild;
  if (options.reset || !config) {
    await clearDiscordProfile(guild);
    return;
  }

  const edits: {
    nick?: string | null;
    avatar?: Buffer | null;
    banner?: Buffer | null;
    bio?: string | null;
    reason: string;
  } = { reason: "Alice bot profile apply" };

  if (config.nick != null) {
    edits.nick = config.nick;
  }
  if (config.bio != null) {
    edits.bio = config.bio;
  }

  if (config.avatar) {
    const avatar = await fetchImageBuffer(config.avatar);
    if (avatar.ok) {
      edits.avatar = avatar.buffer;
    } else {
      logger.warn(`[BotProfile] guild ${guild.id}: avatar fetch failed: ${avatar.error}`);
    }
  }

  if (config.banner && guild.premiumTier >= 2) {
    const banner = await fetchImageBuffer(config.banner);
    if (banner.ok) {
      edits.banner = banner.buffer;
    } else {
      logger.warn(`[BotProfile] guild ${guild.id}: banner fetch failed: ${banner.error}`);
    }
  }

  try {
    await guild.members.editMe(edits);
  } catch (err) {
    logger.warn(`[BotProfile] guild ${guild.id}: editMe failed: ${String(err)}`);
  }
}

async function clearDiscordProfile(guild: Guild): Promise<void> {
  try {
    await guild.members.editMe({
      nick: null,
      avatar: null,
      banner: null,
      bio: null,
      reason: "Alice bot profile reset",
    });
  } catch (err) {
    logger.warn(`[BotProfile] guild ${guild.id}: clear editMe failed: ${String(err)}`);
  }
}

/** Load DB config for this guild and apply it (used on plugin load). */
export async function applyStoredBotProfile(
  pluginData: GuildPluginData<BotProfilePluginType>,
): Promise<void> {
  const config = await pluginData.state.botProfiles.get();
  if (!config) return;
  if (!config.nick && !config.avatar && !config.banner && !config.bio) return;
  await applyBotProfile(pluginData, config);
}
