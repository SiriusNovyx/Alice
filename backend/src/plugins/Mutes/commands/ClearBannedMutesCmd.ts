import { mutesCmd } from "../types.js";
import { actualClearBannedMutesCmd } from "./actualClearBannedMutesCmd.js";

export const ClearBannedMutesCmd = mutesCmd({
  trigger: "clear_banned_mutes",
  permission: "can_cleanup",
  description: "Clear dangling mutes for members who have been banned",

  async run({ pluginData, message: msg }) {
    await actualClearBannedMutesCmd(pluginData, msg);
  },
});
