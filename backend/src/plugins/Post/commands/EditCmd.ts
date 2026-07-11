import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { postCmd } from "../types.js";
import { actualEditCmd } from "../util/actualEditCmd.js";

export const EditCmd = postCmd({
  trigger: "edit",
  permission: "can_post",

  signature: {
    message: ct.messageTarget(),
    content: ct.string({ catchAll: true }),
  },

  async run({ message: msg, args, pluginData }) {
    await actualEditCmd(pluginData, msg, args.message.channel.id, args.message.messageId, args.content);
  },
});
