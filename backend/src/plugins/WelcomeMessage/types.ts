import { BasePluginType, guildPluginEventListener } from "vety";
import { z } from "zod";
import { GuildLogs } from "../../data/GuildLogs.js";
import { zMessageContent } from "../../utils.js";

export const zWelcomeMessageConfig = z.strictObject({
  send_dm: z.boolean().default(false),
  send_to_channel: z.string().nullable().default(null),
  message: zMessageContent.nullable().default(null),
<<<<<<< HEAD
  // Delay in milliseconds before sending the DM, to allow Discord to sync the user's settings
  send_dm_delay: z.number().min(0).max(30000).default(2000),
=======
>>>>>>> a0a54da391085c24c9e28ad6ab2874adc81600a7
});

export interface WelcomeMessagePluginType extends BasePluginType {
  configSchema: typeof zWelcomeMessageConfig;
  state: {
    logs: GuildLogs;
    sentWelcomeMessages: Set<string>;
  };
}

export const welcomeMessageEvt = guildPluginEventListener<WelcomeMessagePluginType>();
