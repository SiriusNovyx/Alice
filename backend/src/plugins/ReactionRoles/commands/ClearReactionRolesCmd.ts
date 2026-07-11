import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { reactionRolesCmd } from "../types.js";
import { actualClearReactionRolesCmd } from "./actualClearReactionRolesCmd.js";

export const ClearReactionRolesCmd = reactionRolesCmd({
  trigger: "reaction_roles clear",
  permission: "can_manage",

  signature: {
    message: ct.messageTarget(),
  },

  async run({ message: msg, args, pluginData }) {
    await actualClearReactionRolesCmd(pluginData, msg, args.message.channel, args.message.messageId);
  },
});
