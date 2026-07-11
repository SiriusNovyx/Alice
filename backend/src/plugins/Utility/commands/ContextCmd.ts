import { TextChannel } from "discord.js";
import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { utilityCmd } from "../types.js";
import { actualContextCmd } from "./actualContextCmd.js";

export const ContextCmd = utilityCmd({
  trigger: "context",
  description: "Get a link to the context of the specified message",
  usage: "!context <channelId> <messageId>",
  permission: "can_context",

  signature: [
    {
      message: ct.messageTarget(),
    },
    {
      channel: ct.channel(),
      messageId: ct.string(),
    },
  ],

  async run({ message: msg, args, pluginData }) {
    if (args.channel && !(args.channel instanceof TextChannel)) {
      void pluginData.state.common.sendErrorMessage(msg, "Channel must be a text channel");
      return;
    }

    const channel = args.channel ?? args.message.channel;
    const messageId = args.messageId ?? args.message.messageId;
    await actualContextCmd(pluginData, msg, channel, messageId);
  },
});
