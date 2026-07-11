import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { timeAndDateCmd } from "../types.js";
import { actualSetTimezoneCmd } from "./actualSetTimezoneCmd.js";

export const SetTimezoneCmd = timeAndDateCmd({
  trigger: "timezone",
  permission: "can_set_timezone",

  signature: {
    timezone: ct.string(),
  },

  async run({ pluginData, message, args }) {
    await actualSetTimezoneCmd(pluginData, message, message.author.id, args.timezone);
  },
});
