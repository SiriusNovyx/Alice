import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { slowmodeCmd } from "../types.js";
import { actualSetSlowmodeCmd } from "../util/actualSetSlowmodeCmd.js";

export const SlowmodeSetCmd = slowmodeCmd({
  trigger: "slowmode",
  usage: "!slowmode <duration> [channel]",
  permission: "can_manage",
  source: "guild",

  signature: [
    {
      time: ct.delay(),

      mode: ct.string({ option: true, shortcut: "m" }),
    },
    {
      channel: ct.textChannel(),
      time: ct.delay(),

      mode: ct.string({ option: true, shortcut: "m" }),
    },
  ],

  async run({ message: msg, args, pluginData }) {
    const channel = args.channel || msg.channel;
    if (!channel.isTextBased() || channel.isThread() || channel.isDMBased()) {
      void pluginData.state.common.sendErrorMessage(msg, "Slowmode can only be set on non-thread text-based channels");
      return;
    }
    await actualSetSlowmodeCmd(pluginData, msg, channel, args.time, args.mode);
  },
});
