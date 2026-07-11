import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { utilityCmd } from "../types.js";
import { actualHelpCmd } from "./actualHelpCmd.js";

export const HelpCmd = utilityCmd({
  trigger: "help",
  description: "Show usage information for one or more commands",
  usage: "!help <command>",
  permission: "can_help",

  signature: {
    command: ct.string({ catchAll: true }),
  },

  async run({ message: msg, args, pluginData }) {
    await actualHelpCmd(pluginData, msg, args.command);
  },
});
