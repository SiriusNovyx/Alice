import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { resolveMessageMember } from "../../../pluginUtils.js";
import { reactionRolesCmd } from "../types.js";
import { actualInitReactionRolesCmd, INIT_REACTION_ROLES_DESCRIPTION } from "./actualInitReactionRolesCmd.js";

export const InitReactionRolesCmd = reactionRolesCmd({
  trigger: "reaction_roles",
  permission: "can_manage",
  description: INIT_REACTION_ROLES_DESCRIPTION,

  signature: {
    message: ct.messageTarget(),
    reactionRolePairs: ct.string({ catchAll: true }),

    exclusive: ct.bool({ option: true, isSwitch: true, shortcut: "e" }),
  },

  async run({ message: msg, args, pluginData }) {
    const member = await resolveMessageMember(msg);
    await actualInitReactionRolesCmd(
      pluginData,
      msg,
      member,
      args.message.channel,
      args.message.messageId,
      args.reactionRolePairs,
      args.exclusive ?? false,
    );
  },
});
