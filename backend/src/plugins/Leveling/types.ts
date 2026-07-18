import {
  BasePluginType,
  guildPluginEventListener,
  guildPluginMessageCommand,
  guildPluginSlashCommand,
  guildPluginSlashGroup,
  pluginUtils,
} from "vety";
import { z } from "zod";
import { GuildUserLevels } from "../../data/GuildUserLevels.js";
import { zSnowflake } from "../../utils.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";

const zRoleReward = z.strictObject({
  level: z.number().int().min(1),
  role_id: zSnowflake,
});

const zMultiplier = z.strictObject({
  type: z.enum(["role", "user"]),
  target_id: zSnowflake,
  multiplier: z.number().min(0.1).max(10).default(1),
});

export const zLevelingConfig = z.strictObject({
  enabled: z.boolean().default(true),
  min_xp: z.number().int().min(1).max(1000).default(15),
  max_xp: z.number().int().min(1).max(1000).default(25),
  cooldown_seconds: z.number().int().min(0).max(3600).default(60),
  level_up_message: z.string().default("GG {user}, you reached level **{level}**!"),
  level_up_channel_id: zSnowflake.nullable().default(null),
  excluded_channels: z.array(zSnowflake).default([]),
  excluded_roles: z.array(zSnowflake).default([]),
  role_rewards: z.array(zRoleReward).default([]),
  multipliers: z.array(zMultiplier).default([]),
  stack_multipliers: z.boolean().default(true),
  can_manage: z.boolean().default(false),
  can_check: z.boolean().default(true),
});

export interface LevelingPluginType extends BasePluginType {
  configSchema: typeof zLevelingConfig;
  state: {
    userLevels: GuildUserLevels;
    common: pluginUtils.PluginPublicInterface<typeof CommonPlugin>;
    cooldowns: Map<string, number>;
  };
}

export const levelingCmd = guildPluginMessageCommand<LevelingPluginType>();
export const levelingSlashGroup = guildPluginSlashGroup<LevelingPluginType>();
export const levelingSlashCmd = guildPluginSlashCommand<LevelingPluginType>();
export const levelingEvt = guildPluginEventListener<LevelingPluginType>();
