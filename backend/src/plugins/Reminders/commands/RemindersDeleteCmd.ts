import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { remindersCmd } from "../types.js";
import { actualRemindersDeleteCmd } from "./actualRemindersDeleteCmd.js";

export const RemindersDeleteCmd = remindersCmd({
  trigger: ["reminders delete", "reminders d"],
  permission: "can_use",

  signature: {
    num: ct.number(),
  },

  async run({ message: msg, args, pluginData }) {
    await actualRemindersDeleteCmd(pluginData, msg, msg.author.id, args.num);
  },
});
