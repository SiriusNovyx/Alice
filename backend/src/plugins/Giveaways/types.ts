import {
  BasePluginType,
  guildPluginEventListener,
  guildPluginMessageCommand,
  guildPluginSlashCommand,
  guildPluginSlashGroup,
  pluginUtils,
} from "vety";
import { z } from "zod";
import { GuildGiveaways } from "../../data/GuildGiveaways.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";

export const zGiveawaysConfig = z.strictObject({
  enabled: z.boolean().default(false),
  can_manage: z.boolean().default(false),
  can_enter: z.boolean().default(true),
});

export interface GiveawaysPluginType extends BasePluginType {
  configSchema: typeof zGiveawaysConfig;
  state: {
    giveaways: GuildGiveaways;
    common: pluginUtils.PluginPublicInterface<typeof CommonPlugin>;
    ending: Map<string, Promise<string[]>>;
    pollTimer: ReturnType<typeof setInterval> | null;
    pollRunning: boolean;
  };
}

export const giveawaysCmd = guildPluginMessageCommand<GiveawaysPluginType>();
export const giveawaysSlashGroup = guildPluginSlashGroup<GiveawaysPluginType>();
export const giveawaysSlashCmd = guildPluginSlashCommand<GiveawaysPluginType>();
export const giveawaysEvt = guildPluginEventListener<GiveawaysPluginType>();
