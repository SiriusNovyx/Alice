import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { slowmodeCmd } from "../types.js";
import { actualDisableSlowmodeCmd } from "../util/actualDisableSlowmodeCmd.js";

export const SlowmodeDisableCmd = slowmodeCmd({
  trigger: ["slowmode disable", "slowmode d"],
  usage: "!slowmode disable [channel]",
  permission: "can_manage",

  signature: {
    channel: ct.textChannel(),
  },

  async run({ message: msg, args, pluginData }) {
    if (args.channel.isThread()) {
      void pluginData.state.common.sendErrorMessage(msg, "Cannot disable slowmode on this channel type");
      return;
    }
    await actualDisableSlowmodeCmd(pluginData, msg, args.channel);
  },
});
