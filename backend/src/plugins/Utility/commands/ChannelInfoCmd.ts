import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { utilityCmd } from "../types.js";
import { actualChannelInfoCmd } from "./actualInfoCmds.js";

export const ChannelInfoCmd = utilityCmd({
  trigger: ["channel", "channelinfo"],
  description: "Show information about a channel",
  usage: "!channel <channel>",
  permission: "can_channelinfo",

  signature: {
    channel: ct.channelId({ required: false }),
  },

  async run({ message, args, pluginData }) {
    await actualChannelInfoCmd(pluginData, message, args.channel);
  },
});
