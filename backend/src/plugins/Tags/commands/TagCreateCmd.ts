import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { tagsCmd } from "../types.js";
import { actualTagCreateCmd } from "./actualTagCreateCmd.js";

export const TagCreateCmd = tagsCmd({
  trigger: "tag",
  usage: "!tag <name> <content>",
  permission: "can_create",

  signature: {
    tag: ct.string(),
    body: ct.string({ catchAll: true }),
  },

  async run({ message: msg, args, pluginData }) {
    await actualTagCreateCmd(pluginData, msg, msg.author.id, args.tag, args.body);
  },
});
