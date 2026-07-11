import { helpers } from "vety";
import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { renderUsername } from "../../../utils.js";
import { formatLevelReply } from "../functions/formatUtilityReplies.js";
import { utilityCmd } from "../types.js";

const { getMemberLevel } = helpers;

export const LevelCmd = utilityCmd({
  trigger: "level",
  description: "Show the permission level of a user",
  usage: "!level [user]",
  permission: "can_level",

  signature: {
    member: ct.resolvedMember({ required: false }),
  },

  run({ message, args, pluginData }) {
    const member = args.member || message.member;
    const level = getMemberLevel(pluginData, member);
    message.channel.send(formatLevelReply(renderUsername(member), level));
  },
});
