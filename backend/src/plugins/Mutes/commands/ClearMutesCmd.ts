import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { mutesCmd } from "../types.js";
import { actualClearMutesCmd } from "./actualClearMutesCmd.js";

export const ClearMutesCmd = mutesCmd({
  trigger: "clear_mutes",
  permission: "can_cleanup",
  description: "Clear dangling mute records from the bot. Be careful not to clear valid mutes.",

  signature: {
    userIds: ct.string({ rest: true }),
  },

  async run({ pluginData, message: msg, args }) {
    await actualClearMutesCmd(pluginData, msg, args.userIds);
  },
});
