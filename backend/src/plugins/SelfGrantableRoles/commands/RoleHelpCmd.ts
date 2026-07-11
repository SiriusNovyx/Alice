import { selfGrantableRolesCmd } from "../types.js";
import { actualRoleHelpCmd } from "./actualRoleHelpCmd.js";

export const RoleHelpCmd = selfGrantableRolesCmd({
  trigger: ["role help", "role"],
  permission: null,

  async run({ message: msg, pluginData }) {
    await actualRoleHelpCmd(pluginData, msg);
  },
});
