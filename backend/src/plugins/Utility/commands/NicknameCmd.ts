import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { resolveMessageMember } from "../../../pluginUtils.js";
import { utilityCmd } from "../types.js";
import { actualNicknameCmd } from "./actualNicknameCmd.js";

export const NicknameCmd = utilityCmd({
  trigger: ["nickname", "nick"],
  description: "Set a member's nickname",
  usage: "!nickname <user> <nickname>",
  permission: "can_nickname",

  signature: {
    member: ct.resolvedMember(),
    nickname: ct.string({ catchAll: true, required: false }),
  },

  async run({ message: msg, args, pluginData }) {
    const authorMember = await resolveMessageMember(msg);
    await actualNicknameCmd(
      pluginData,
      msg,
      authorMember,
      args.member,
      args.nickname ? "set" : "view",
      args.nickname,
    );
  },
});
