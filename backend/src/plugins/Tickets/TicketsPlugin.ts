import { guildPlugin } from "vety";
import { GuildArchives } from "../../data/GuildArchives.js";
import { GuildTicketPanels } from "../../data/GuildTicketPanels.js";
import { GuildTickets } from "../../data/GuildTickets.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import { TicketAddCmd, TicketClaimCmd, TicketCloseCmd, TicketPanelCmd, TicketRemoveCmd } from "./commands/TicketCmds.js";
import {
  TicketAddSlashCmd,
  TicketClaimSlashCmd,
  TicketCloseSlashCmd,
  TicketPanelSlashCmd,
  TicketRemoveSlashCmd,
} from "./commands/TicketSlashCmds.js";
import { TicketInteractionEvt } from "./events/TicketInteractionEvt.js";
import { TicketsPluginType, ticketsSlashGroup, zTicketsConfig } from "./types.js";

export const TicketsPlugin = guildPlugin<TicketsPluginType>()({
  name: "tickets",

  configSchema: zTicketsConfig,
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
    TicketPanelCmd,
    TicketCloseCmd,
    TicketClaimCmd,
    TicketAddCmd,
    TicketRemoveCmd,
  ],

  slashCommands: [
    ticketsSlashGroup({
      name: "ticket",
      description: "Support tickets",
      defaultMemberPermissions: "0",
      subcommands: [
        TicketPanelSlashCmd,
        TicketCloseSlashCmd,
        TicketClaimSlashCmd,
        TicketAddSlashCmd,
        TicketRemoveSlashCmd,
      ],
    }),
  ],

  events: [TicketInteractionEvt],

  beforeLoad(pluginData) {
    pluginData.state.tickets = GuildTickets.getGuildInstance(pluginData.guild.id);
    pluginData.state.panels = GuildTicketPanels.getGuildInstance(pluginData.guild.id);
    pluginData.state.archives = GuildArchives.getGuildInstance(pluginData.guild.id);
    pluginData.state.opening = new Set();
  },

  beforeStart(pluginData) {
    pluginData.state.common = pluginData.getPlugin(CommonPlugin);
  },
});
