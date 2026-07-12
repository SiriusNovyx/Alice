import moment from "moment-timezone";
import { guildPlugin } from "vety";
import { GuildGiveaways } from "../../data/GuildGiveaways.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import { GwEndCmd, GwListCmd, GwRerollCmd, GwStartCmd } from "./commands/GiveawayCmds.js";
import { GwEndSlashCmd, GwListSlashCmd, GwRerollSlashCmd, GwStartSlashCmd } from "./commands/GiveawaySlashCmds.js";
import { GiveawayInteractionEvt } from "./events/GiveawayInteractionEvt.js";
import { endGiveaway } from "./functions/giveawayHelpers.js";
import { GiveawaysPluginType, giveawaysSlashGroup, zGiveawaysConfig } from "./types.js";

const POLL_MS = 15_000;

export const GiveawaysPlugin = guildPlugin<GiveawaysPluginType>()({
  name: "giveaways",

  configSchema: zGiveawaysConfig,
  defaultOverrides: [
    {
      level: ">=50",
      config: {
        can_manage: true,
      },
    },
  ],

  // prettier-ignore
  messageCommands: [
    GwStartCmd,
    GwEndCmd,
    GwRerollCmd,
    GwListCmd,
  ],

  slashCommands: [
    giveawaysSlashGroup({
      name: "giveaway",
      description: "Giveaways",
      defaultMemberPermissions: "0",
      subcommands: [GwStartSlashCmd, GwEndSlashCmd, GwRerollSlashCmd, GwListSlashCmd],
    }),
  ],

  events: [GiveawayInteractionEvt],

  beforeLoad(pluginData) {
    pluginData.state.giveaways = GuildGiveaways.getGuildInstance(pluginData.guild.id);
    pluginData.state.ending = new Map();
    pluginData.state.pollTimer = null;
    pluginData.state.pollRunning = false;
  },

  beforeStart(pluginData) {
    pluginData.state.common = pluginData.getPlugin(CommonPlugin);
  },

  afterLoad(pluginData) {
    pluginData.state.pollTimer = setInterval(() => {
      if (pluginData.state.pollRunning) return;
      pluginData.state.pollRunning = true;
      void (async () => {
        try {
          if (!pluginData.config.get().enabled) return;
          const now = moment.utc().format("YYYY-MM-DD HH:mm:ss");
          const due = await pluginData.state.giveaways.findDue(now);
          for (const row of due) {
            await endGiveaway(pluginData, row).catch((err) =>
              console.error(`[Giveaways] end failed for ${row.message_id}:`, err),
            );
          }
        } finally {
          pluginData.state.pollRunning = false;
        }
      })();
    }, POLL_MS);
  },

  beforeUnload(pluginData) {
    if (pluginData.state.pollTimer) {
      clearInterval(pluginData.state.pollTimer);
      pluginData.state.pollTimer = null;
    }
  },
});
