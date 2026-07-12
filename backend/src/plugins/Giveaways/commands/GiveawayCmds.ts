import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { giveawaysCmd } from "../types.js";
import { actualEndCmd, actualListCmd, actualRerollCmd, actualStartCmd } from "./actualGiveawayCmds.js";

export const GwStartCmd = giveawaysCmd({
  trigger: ["gstart", "giveaway-start"],
  usage: "!gstart <duration> <winners> <prize>",
  permission: "can_manage",
  signature: {
    duration: ct.string(),
    winners: ct.number(),
    prize: ct.string({ catchAll: true }),
  },
  async run({ message: msg, args, pluginData }) {
    if (!msg.channel.isTextBased() || msg.channel.isDMBased()) return;
    await actualStartCmd(
      pluginData,
      msg,
      msg.author.id,
      msg.channel.id,
      args.prize,
      args.duration,
      args.winners,
      [],
    );
  },
});

export const GwEndCmd = giveawaysCmd({
  trigger: ["gend", "giveaway-end"],
  usage: "!gend <message-id>",
  permission: "can_manage",
  signature: { messageId: ct.anyId() },
  async run({ message: msg, args, pluginData }) {
    await actualEndCmd(pluginData, msg, args.messageId);
  },
});

export const GwRerollCmd = giveawaysCmd({
  trigger: ["greroll", "giveaway-reroll"],
  usage: "!greroll <message-id> [count]",
  permission: "can_manage",
  signature: {
    messageId: ct.anyId(),
    count: ct.number({ required: false }),
  },
  async run({ message: msg, args, pluginData }) {
    await actualRerollCmd(pluginData, msg, args.messageId, args.count ?? null);
  },
});

export const GwListCmd = giveawaysCmd({
  trigger: ["glist", "giveaway-list"],
  usage: "!glist",
  permission: "can_manage",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualListCmd(pluginData, msg);
  },
});
