import {
  BasePluginType,
  guildPluginEventListener,
  guildPluginMessageCommand,
  guildPluginSlashCommand,
  guildPluginSlashGroup,
  pluginUtils,
} from "vety";
import { z } from "zod";
import { GuildVoiceMasterChannels } from "../../data/GuildVoiceMasterChannels.js";
import { zSnowflake } from "../../utils.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";

export const zVoiceMasterConfig = z.strictObject({
  enabled: z.boolean().default(false),
  hub_channel_id: zSnowflake.nullable().default(null),
  category_id: zSnowflake.nullable().default(null),
  default_name: z.string().max(100).default("{user}'s Channel"),
  default_limit: z.number().int().min(0).max(99).default(0),
  can_control: z.boolean().default(true),
  can_setup: z.boolean().default(false),
});

export interface VoiceMasterPluginType extends BasePluginType {
  configSchema: typeof zVoiceMasterConfig;
  state: {
    voiceChannels: GuildVoiceMasterChannels;
    common: pluginUtils.PluginPublicInterface<typeof CommonPlugin>;
    creating: Set<string>;
  };
}

export const voiceMasterCmd = guildPluginMessageCommand<VoiceMasterPluginType>();
export const voiceMasterSlashGroup = guildPluginSlashGroup<VoiceMasterPluginType>();
export const voiceMasterSlashCmd = guildPluginSlashCommand<VoiceMasterPluginType>();
export const voiceMasterEvt = guildPluginEventListener<VoiceMasterPluginType>();
