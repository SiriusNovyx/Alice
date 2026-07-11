import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { resolveMessageMember } from "../../../pluginUtils.js";
import { utilityCmd } from "../types.js";
import { actualNicknameCmd } from "./actualNicknameCmd.js";

export const NicknameResetCmd = utilityCmd({
  trigger: ["nickname reset", "nick reset"],
  description: "Reset a member's nickname to their username",
  usage: "!nickname reset <user>",
  permission: "can_nickname",

  signature: {
    member: ct.resolvedMember(),
  },

  async run({ message: msg, args, pluginData }) {
    const authorMember = await resolveMessageMember(msg);
    await actualNicknameCmd(pluginData, msg, authorMember, args.member, "reset");
  },
});
