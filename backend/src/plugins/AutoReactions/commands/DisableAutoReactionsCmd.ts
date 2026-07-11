import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { autoReactionsCmd } from "../types.js";
import { actualDisableAutoReactionsCmd } from "./actualDisableAutoReactionsCmd.js";

export const DisableAutoReactionsCmd = autoReactionsCmd({
  trigger: "auto_reactions disable",
  permission: "can_manage",
  usage: "!auto_reactions disable <channel>",

  signature: {
    channelId: ct.channelId(),
  },

  async run({ message: msg, args, pluginData }) {
    await actualDisableAutoReactionsCmd(pluginData, msg, args.channelId);
  },
});
