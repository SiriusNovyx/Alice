import { utilityCmd } from "../types.js";
import { actualCommandsCatalogCmd } from "./actualCommandsCatalogCmd.js";

export const CommandsCmd = utilityCmd({
  trigger: "commands",
  description: "Open the Alice Help Center with categorized commands",
  usage: "!commands",
  permission: "can_help",

  async run({ message: msg, pluginData }) {
    await actualCommandsCatalogCmd(pluginData, msg);
  },
});
