import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { utilityCmd } from "../types.js";
import { actualMessageInfoCmd } from "./actualInfoCmds.js";

export const MessageInfoCmd = utilityCmd({
  trigger: ["message", "messageinfo"],
  description: "Show information about a message",
  usage: "!message <channelId>-<messageId>",
  permission: "can_messageinfo",

  signature: {
    message: ct.messageTarget(),
  },

  async run({ message, args, pluginData }) {
    await actualMessageInfoCmd(pluginData, message, args.message.channel.id, args.message.messageId);
  },
});
