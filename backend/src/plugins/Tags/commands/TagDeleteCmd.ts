import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { tagsCmd } from "../types.js";
import { actualTagDeleteCmd } from "./actualTagDeleteCmd.js";

export const TagDeleteCmd = tagsCmd({
  trigger: "tag delete",
  usage: "!tag delete <name>",
  permission: "can_create",

  signature: {
    tag: ct.string(),
  },

  async run({ message: msg, args, pluginData }) {
    await actualTagDeleteCmd(pluginData, msg, args.tag);
  },
});
