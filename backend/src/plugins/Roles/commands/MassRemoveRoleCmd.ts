import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { resolveMessageMember } from "../../../pluginUtils.js";
import { resolveRoleId } from "../../../utils.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { rolesCmd } from "../types.js";
import { actualMassRemoveRoleCmd } from "./actualMassRemoveRoleCmd.js";

export const MassRemoveRoleCmd = rolesCmd({
  trigger: "massremoverole",
  usage: "!massremoverole <role> [user] [user] ...",
  permission: "can_mass_assign",

  signature: {
    role: ct.string(),
    members: ct.string({ rest: true }),
  },

  async run({ message: msg, args, pluginData }) {
    const authorMember = await resolveMessageMember(msg);

    const roleId = await resolveRoleId(pluginData.client, pluginData.guild.id, args.role);
    if (!roleId) {
      void pluginData.state.common.sendErrorMessage(msg, "Invalid role id");
      return;
    }

    const config = await pluginData.config.getForMessage(msg);
    if (!config.assignable_roles.includes(roleId)) {
      void pluginData.state.common.sendErrorMessage(msg, "You cannot remove that role");
      return;
    }

    const role = pluginData.guild.roles.cache.get(roleId);
    if (!role) {
      pluginData.getPlugin(LogsPlugin).logBotAlert({
        body: `Unknown role configured for 'roles' plugin: ${roleId}`,
      });
      void pluginData.state.common.sendErrorMessage(msg, "You cannot remove that role");
      return;
    }

    await actualMassRemoveRoleCmd(pluginData, msg, authorMember, msg.author, role, args.members);
  },
});
