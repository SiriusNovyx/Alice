import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { tagsCmd } from "../types.js";
import { actualTagListCmd } from "./actualTagListCmd.js";

export const TagListCmd = tagsCmd({
  trigger: ["tag list", "tags", "taglist"],
  permission: "can_list",

  signature: {
    search: ct.string({ required: false }),
  },

  async run({ message: msg, args, pluginData }) {
    await actualTagListCmd(pluginData, msg, args.search);
  },
});
