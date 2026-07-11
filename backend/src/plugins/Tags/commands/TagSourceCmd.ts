import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { tagsCmd } from "../types.js";
import { actualTagDeleteCmd } from "./actualTagDeleteCmd.js";
import { actualTagGetCmd } from "./actualTagGetCmd.js";

export const TagSourceCmd = tagsCmd({
  trigger: "tag",
  permission: "can_create",

  signature: {
    tag: ct.string(),

    delete: ct.bool({ option: true, shortcut: "d", isSwitch: true }),
  },

  async run({ message: msg, args, pluginData }) {
    if (args.delete) {
      await actualTagDeleteCmd(pluginData, msg, args.tag);
      return;
    }

    await actualTagGetCmd(pluginData, msg, args.tag);
  },
});
