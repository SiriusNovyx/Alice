import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { autoReactionsCmd } from "../types.js";
import { actualNewAutoReactionsCmd } from "./actualNewAutoReactionsCmd.js";

export const NewAutoReactionsCmd = autoReactionsCmd({
  trigger: "auto_reactions",
  permission: "can_manage",
  usage: "!auto_reactions <channel> <emoji> [emoji...]",

  signature: {
    channel: ct.guildTextBasedChannel(),
    reactions: ct.string({ rest: true }),
  },

  async run({ message: msg, args, pluginData }) {
    await actualNewAutoReactionsCmd(pluginData, msg, args.channel, args.reactions);
  },
});
