import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { messageSaverCmd } from "../types.js";
import { actualSavePinsToDBCmd } from "./actualSavePinsToDBCmd.js";

export const SavePinsToDBCmd = messageSaverCmd({
  trigger: "save_pins_to_db",
  permission: "can_manage",
  source: "guild",

  signature: {
    channel: ct.textChannel(),
  },

  async run({ message: msg, args, pluginData }) {
    await actualSavePinsToDBCmd(pluginData, msg, args.channel);
  },
});
