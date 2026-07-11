import { remindersCmd } from "../types.js";
import { actualRemindersListCmd } from "./actualRemindersListCmd.js";

export const RemindersCmd = remindersCmd({
  trigger: "reminders",
  permission: "can_use",

  async run({ message: msg, pluginData }) {
    await actualRemindersListCmd(pluginData, msg, msg.author.id);
  },
});
