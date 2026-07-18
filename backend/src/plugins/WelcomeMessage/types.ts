import {
  BasePluginType,
  guildPluginEventListener,
  guildPluginMessageCommand,
  pluginUtils,
} from "vety";
import { z } from "zod";
import { GuildLogs } from "../../data/GuildLogs.js";
import { zMessageContent } from "../../utils.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";

export const zWelcomeMessageConfig = z.strictObject({
  enabled: z.boolean().default(true),
  send_dm: z.boolean().default(false),
  send_to_channel: z.string().nullable().default(null),
  message: zMessageContent.nullable().default(null),
  // Delay in milliseconds before sending the DM, to allow Discord to sync the user's settings
  send_dm_delay: z.number().min(0).max(30000).default(2000),
  /** Auto-delete channel welcome after N seconds (null/0 = never). */
  delete_after: z.number().int().min(0).max(604800).nullable().default(null),
  /** Plain text sent with the embed template (XEON-style content/ping line). */
  content: z.string().nullable().default(null),
  embed_title: z.string().nullable().default(null),
  embed_description: z.string().nullable().default(null),
  /** Hex color, e.g. `#5865F2` or `5865F2`. */
  embed_color: z.string().nullable().default(null),
  embed_thumbnail: z.string().nullable().default(null),
  embed_image: z.string().nullable().default(null),
  can_manage: z.boolean().default(false),
});

export type WelcomeMessageConfig = z.infer<typeof zWelcomeMessageConfig>;

export interface WelcomeMessagePluginType extends BasePluginType {
  configSchema: typeof zWelcomeMessageConfig;
  state: {
    logs: GuildLogs;
    sentWelcomeMessages: Set<string>;
    common: pluginUtils.PluginPublicInterface<typeof CommonPlugin>;
  };
}

export const welcomeMessageCmd = guildPluginMessageCommand<WelcomeMessagePluginType>();
export const welcomeMessageEvt = guildPluginEventListener<WelcomeMessagePluginType>();
