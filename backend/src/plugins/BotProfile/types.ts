import { BasePluginType, guildPluginEventListener, guildPluginMessageCommand, guildPluginSlashCommand } from "vety";
import { z } from "zod";
import { GuildBotProfiles } from "../../data/GuildBotProfiles.js";

export const zBotProfileConfig = z.strictObject({
  enabled: z.boolean().default(false),
  can_manage: z.boolean().default(false),
});

export interface BotProfilePluginType extends BasePluginType {
  configSchema: typeof zBotProfileConfig;
  state: {
    botProfiles: GuildBotProfiles;
  };
}

export const botProfileCmd = guildPluginMessageCommand<BotProfilePluginType>();
export const botProfileSlashCmd = guildPluginSlashCommand<BotProfilePluginType>();
export const botProfileEvt = guildPluginEventListener<BotProfilePluginType>();
