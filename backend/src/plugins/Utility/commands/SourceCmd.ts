import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { utilityCmd } from "../types.js";
import { actualSourceCmd } from "./actualSourceCmd.js";

export const SourceCmd = utilityCmd({
  trigger: "source",
  description: "View the message source of the specified message id",
  usage: "!source <messageId>",
  permission: "can_source",

  signature: {
    message: ct.messageTarget(),
  },

  async run({ message: cmdMessage, args, pluginData }) {
    await actualSourceCmd(pluginData, cmdMessage, args.message.channel, args.message.messageId);
  },
});
