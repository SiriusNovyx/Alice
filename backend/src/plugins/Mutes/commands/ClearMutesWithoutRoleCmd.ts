import { mutesCmd } from "../types.js";
import { actualClearMutesWithoutRoleCmd } from "./actualClearMutesWithoutRoleCmd.js";

export const ClearMutesWithoutRoleCmd = mutesCmd({
  trigger: "clear_mutes_without_role",
  permission: "can_cleanup",
  description: "Clear dangling mutes for members whose mute role was removed by other means",

  async run({ pluginData, message: msg }) {
    await actualClearMutesWithoutRoleCmd(pluginData, msg);
  },
});
