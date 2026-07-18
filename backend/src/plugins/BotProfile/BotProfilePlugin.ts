import { guildPlugin } from "vety";
import { GuildBotProfiles } from "../../data/GuildBotProfiles.js";
import { CustomBotCmd } from "./commands/BotProfileCmds.js";
import { CustomBotSlashCmd } from "./commands/BotProfileSlashCmds.js";
import { BotProfileInteractionEvt } from "./events/BotProfileInteractionEvt.js";
import { applyStoredBotProfile } from "./functions/applyBotProfile.js";
import { BotProfilePluginType, zBotProfileConfig } from "./types.js";

/**
 * Per-guild bot nickname / avatar / banner / bio (CustomBot).
 * Free for all servers — no premium, slots, or expiry checks.
 */
export const BotProfilePlugin = guildPlugin<BotProfilePluginType>()({
  name: "bot_profile",

  configSchema: zBotProfileConfig,
  defaultOverrides: [
    {
      level: ">=50",
      config: {
        can_manage: true,
      },
    },
  ],

  messageCommands: [CustomBotCmd],
  slashCommands: [CustomBotSlashCmd],
  events: [BotProfileInteractionEvt],

  beforeLoad(pluginData) {
    pluginData.state.botProfiles = GuildBotProfiles.getGuildInstance(pluginData.guild.id);
  },

  async afterLoad(pluginData) {
    await applyStoredBotProfile(pluginData);
  },
});