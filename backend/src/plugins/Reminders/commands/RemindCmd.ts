import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { messageLink } from "../../../utils.js";
import { remindersCmd } from "../types.js";
import { actualRemindCmd } from "./actualRemindCmd.js";

export const RemindCmd = remindersCmd({
  trigger: ["remind", "remindme", "reminder"],
  usage: "!remind <time> [reminder]",
  permission: "can_use",

  signature: {
    time: ct.string(),
    reminder: ct.string({ required: false, catchAll: true }),
  },

  async run({ message: msg, args, pluginData }) {
    await actualRemindCmd(
      pluginData,
      msg,
      msg.author.id,
      msg.channel.id,
      args.time,
      args.reminder,
      messageLink(pluginData.guild.id, msg.channel.id, msg.id),
    );
  },
});
