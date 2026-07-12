import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { ticketsCmd } from "../types.js";
import {
  actualAddCmd,
  actualClaimCmd,
  actualCloseCmd,
  actualPanelCmd,
  actualRemoveCmd,
} from "./actualTicketCmds.js";

export const TicketPanelCmd = ticketsCmd({
  trigger: ["ticket-panel", "ticketpanel"],
  usage: "!ticket-panel",
  permission: "can_manage",
  signature: {},
  async run({ message: msg, pluginData }) {
    if (!msg.channel.isTextBased() || msg.channel.isDMBased()) return;
    await actualPanelCmd(pluginData, msg, msg.channel as any);
  },
});

export const TicketCloseCmd = ticketsCmd({
  trigger: ["ticket-close", "tclose"],
  usage: "!ticket-close [reason]",
  permission: "can_use",
  signature: {
    reason: ct.string({ required: false, catchAll: true }),
  },
  async run({ message: msg, args, pluginData }) {
    if (!msg.member) return;
    const memberConfig = await pluginData.config.getForMember(msg.member);
    await actualCloseCmd(
      pluginData,
      msg,
      msg.channel.id,
      msg.author.id,
      args.reason ?? null,
      memberConfig.can_manage,
    );
  },
});

export const TicketClaimCmd = ticketsCmd({
  trigger: ["ticket-claim", "tclaim"],
  usage: "!ticket-claim",
  permission: "can_manage",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualClaimCmd(pluginData, msg, msg.channel.id, msg.author.id);
  },
});

export const TicketAddCmd = ticketsCmd({
  trigger: ["ticket-add", "tadd"],
  usage: "!ticket-add <user>",
  permission: "can_manage",
  signature: {
    user: ct.user(),
  },
  async run({ message: msg, args, pluginData }) {
    await actualAddCmd(pluginData, msg, msg.channel.id, args.user.id);
  },
});

export const TicketRemoveCmd = ticketsCmd({
  trigger: ["ticket-remove", "tremove"],
  usage: "!ticket-remove <user>",
  permission: "can_manage",
  signature: {
    user: ct.user(),
  },
  async run({ message: msg, args, pluginData }) {
    await actualRemoveCmd(pluginData, msg, msg.channel.id, args.user.id);
  },
});
