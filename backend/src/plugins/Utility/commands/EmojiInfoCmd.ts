import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { utilityCmd } from "../types.js";
import { actualEmojiInfoCmd } from "./actualInfoCmds.js";

export const EmojiInfoCmd = utilityCmd({
  trigger: ["emoji", "emojiinfo"],
  description: "Show information about an emoji",
  usage: "!emoji <emoji>",
  permission: "can_emojiinfo",

  signature: {
    emoji: ct.string({ required: true }),
  },

  async run({ message, args, pluginData }) {
    await actualEmojiInfoCmd(pluginData, message, args.emoji);
  },
});
