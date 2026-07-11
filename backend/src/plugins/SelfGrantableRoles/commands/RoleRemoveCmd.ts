import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { selfGrantableRolesCmd } from "../types.js";
import { actualRoleRemoveCmd } from "./actualRoleRemoveCmd.js";

export const RoleRemoveCmd = selfGrantableRolesCmd({
  trigger: "role remove",
  permission: null,

  signature: {
    roleNames: ct.string({ rest: true }),
  },

  async run({ message: msg, args, pluginData }) {
    await actualRoleRemoveCmd(pluginData, msg, msg.author, msg.author.id, args.roleNames);
  },
});
