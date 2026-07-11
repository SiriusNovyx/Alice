import { timeAndDateCmd } from "../types.js";
import { actualViewTimezoneCmd } from "./actualViewTimezoneCmd.js";

export const ViewTimezoneCmd = timeAndDateCmd({
  trigger: "timezone",
  permission: "can_set_timezone",

  signature: {},

  async run({ pluginData, message }) {
    await actualViewTimezoneCmd(pluginData, message, message.author.id);
  },
});
