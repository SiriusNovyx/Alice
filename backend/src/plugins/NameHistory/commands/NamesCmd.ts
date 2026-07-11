import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { nameHistoryCmd } from "../types.js";
import { actualNamesCmd } from "./actualNamesCmd.js";

export const NamesCmd = nameHistoryCmd({
  trigger: "names",
  permission: "can_view",

  signature: {
    userId: ct.userId(),
  },

  async run({ message: msg, args, pluginData }) {
    await actualNamesCmd(pluginData, msg, args.userId);
  },
});
