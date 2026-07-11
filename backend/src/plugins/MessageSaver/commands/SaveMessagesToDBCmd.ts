import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { messageSaverCmd } from "../types.js";
import { actualSaveMessagesToDBCmd } from "./actualSaveMessagesToDBCmd.js";

export const SaveMessagesToDBCmd = messageSaverCmd({
  trigger: "save_messages_to_db",
  permission: "can_manage",
  source: "guild",

  signature: {
    channel: ct.textChannel(),
    ids: ct.string({ catchAll: true }),
  },

  async run({ message: msg, args, pluginData }) {
    await actualSaveMessagesToDBCmd(pluginData, msg, args.channel, args.ids.trim().split(/\s+/).filter(Boolean));
  },
});
