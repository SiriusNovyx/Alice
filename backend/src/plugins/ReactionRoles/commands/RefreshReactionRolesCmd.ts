import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { reactionRolesCmd } from "../types.js";
import { actualRefreshReactionRolesCmd } from "./actualRefreshReactionRolesCmd.js";

export const RefreshReactionRolesCmd = reactionRolesCmd({
  trigger: "reaction_roles refresh",
  permission: "can_manage",

  signature: {
    message: ct.messageTarget(),
  },

  async run({ message: msg, args, pluginData }) {
    await actualRefreshReactionRolesCmd(pluginData, msg, args.message.channel.id, args.message.messageId);
  },
});
