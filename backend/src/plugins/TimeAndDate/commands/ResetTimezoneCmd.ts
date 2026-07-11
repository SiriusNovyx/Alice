import { timeAndDateCmd } from "../types.js";
import { actualResetTimezoneCmd } from "./actualResetTimezoneCmd.js";

export const ResetTimezoneCmd = timeAndDateCmd({
  trigger: "timezone reset",
  permission: "can_set_timezone",

  signature: {},

  async run({ pluginData, message }) {
    await actualResetTimezoneCmd(pluginData, message, message.author.id);
  },
});
