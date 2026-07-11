import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { locateUserCmd } from "../types.js";
import { actualListFollowCmd } from "./actualListFollowCmd.js";
import { actualUnfollowCmd } from "./actualUnfollowCmd.js";

export const ListFollowCmd = locateUserCmd({
  trigger: ["follows", "fs"],
  description: "Displays all of your active alerts ordered by expiration time",
  usage: "!fs",
  permission: "can_alert",

  async run({ message: msg, pluginData }) {
    await actualListFollowCmd(pluginData, msg, msg.author.id);
  },
});

export const DeleteFollowCmd = locateUserCmd({
  trigger: ["follows delete", "fs d"],
  description:
    "Deletes the alert at the position <num>.\nThe value needed for <num> can be found using `!follows` (`!fs`)",
  usage: "!fs d <num>",
  permission: "can_alert",

  signature: {
    num: ct.number({ required: true }),
  },

  async run({ message: msg, args, pluginData }) {
    await actualUnfollowCmd(pluginData, msg, msg.author.id, args.num);
  },
});
