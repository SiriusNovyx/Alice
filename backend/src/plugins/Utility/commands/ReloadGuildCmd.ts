import { utilityCmd } from "../types.js";
import { actualReloadGuildCmd } from "./actualReloadGuildCmd.js";

export const ReloadGuildCmd = utilityCmd({
  trigger: "reload_guild",
  description: "Reload the Alice configuration and all plugins for the server. This can sometimes fix issues.",
  permission: "can_reload_guild",

  async run({ message: msg, pluginData }) {
    await actualReloadGuildCmd(pluginData, msg);
  },
});
