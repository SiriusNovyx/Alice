import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { postCmd } from "../types.js";
import { actualEditEmbedCmd } from "../util/actualEditCmd.js";

export const EditEmbedCmd = postCmd({
  trigger: "edit_embed",
  permission: "can_post",

  signature: {
    message: ct.messageTarget(),
    maincontent: ct.string({ catchAll: true }),

    title: ct.string({ option: true }),
    content: ct.string({ option: true }),
    color: ct.string({ option: true }),
    raw: ct.bool({ option: true, isSwitch: true, shortcut: "r" }),
  },

  async run({ message: msg, args, pluginData }) {
    await actualEditEmbedCmd(pluginData, msg, args.message.channel.id, args.message.messageId, {
      title: args.title,
      content: args.content || args.maincontent,
      color: args.color,
      raw: args.raw,
    });
  },
});
