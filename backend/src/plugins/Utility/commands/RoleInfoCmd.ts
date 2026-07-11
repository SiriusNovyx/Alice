import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { utilityCmd } from "../types.js";
import { actualRoleInfoCmd } from "./actualInfoCmds.js";

export const RoleInfoCmd = utilityCmd({
  trigger: ["roleinfo"],
  description: "Show information about a role",
  usage: "!role <role>",
  permission: "can_roleinfo",

  signature: {
    role: ct.role({ required: true }),
  },

  async run({ message, args, pluginData }) {
    await actualRoleInfoCmd(pluginData, message, args.role);
  },
});
