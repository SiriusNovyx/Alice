import {
  BasePluginType,
  guildPluginMessageCommand,
  guildPluginSlashCommand,
  guildPluginSlashGroup,
  pluginUtils,
} from "vety";
import { z } from "zod";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import { GuildMusicQueueState } from "./functions/lavalink.js";

export const zMusicConfig = z.strictObject({
  enabled: z.boolean().default(false),
  can_use: z.boolean().default(true),
  stay_247: z.boolean().default(false),
  default_volume: z.number().int().min(1).max(200).default(100),
});

export interface MusicPluginType extends BasePluginType {
  configSchema: typeof zMusicConfig;
  state: {
    common: pluginUtils.PluginPublicInterface<typeof CommonPlugin>;
    player: GuildMusicQueueState;
    lavalinkUp: boolean;
  };
}

export const musicCmd = guildPluginMessageCommand<MusicPluginType>();
export const musicSlashGroup = guildPluginSlashGroup<MusicPluginType>();
export const musicSlashCmd = guildPluginSlashCommand<MusicPluginType>();

export { isLavalinkConfigured } from "./functions/lavalink.js";
