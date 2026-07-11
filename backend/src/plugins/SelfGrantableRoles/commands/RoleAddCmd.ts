import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { selfGrantableRolesCmd } from "../types.js";
import { actualRoleAddCmd } from "./actualRoleAddCmd.js";

export const RoleAddCmd = selfGrantableRolesCmd({
  trigger: ["role", "role add"],
  permission: null,

  signature: {
    roleNames: ct.string({ rest: true }),
  },

  async run({ message: msg, args, pluginData }) {
    await actualRoleAddCmd(pluginData, msg, msg.author, msg.author.id, args.roleNames);
  },
});
