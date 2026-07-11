import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { locateUserCmd } from "../types.js";
import { actualFollowCmd } from "./actualFollowCmd.js";

export const FollowCmd = locateUserCmd({
  trigger: ["follow", "f"],
  description: "Sets up an alert that notifies you any time `<member>` switches or joins voice channels",
  usage: "!f <user>",
  permission: "can_alert",

  signature: {
    member: ct.resolvedMember(),
    reminder: ct.string({ required: false, catchAll: true }),

    duration: ct.delay({ option: true, shortcut: "d" }),
    active: ct.bool({ option: true, shortcut: "a", isSwitch: true }),
  },

  async run({ message: msg, args, pluginData }) {
    await actualFollowCmd(
      pluginData,
      msg,
      msg.author.id,
      msg.channel.id,
      args.member,
      args.reminder,
      args.duration,
      args.active || false,
    );
  },
});
