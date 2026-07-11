import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { utilityCmd } from "../types.js";
import { actualInfoCmd } from "./actualInfoCmds.js";

export const InfoCmd = utilityCmd({
  trigger: "info",
  description: "Show information about the specified thing",
  usage: "!info",
  permission: "can_info",

  signature: {
    value: ct.string({ required: false }),
    compact: ct.switchOption({ def: false, shortcut: "c" }),
  },

  async run({ message, args, pluginData }) {
    const value = args.value || message.author.id;
    await actualInfoCmd(pluginData, message, value, Boolean(args.compact));
  },
});
