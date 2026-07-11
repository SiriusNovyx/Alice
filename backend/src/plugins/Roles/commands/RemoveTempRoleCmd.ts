import { GuildChannel } from "discord.js";
import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { clearExpiringTempRole } from "../../../data/loops/expiringTempRolesLoop.js";
import { canActOn, resolveMessageMember } from "../../../pluginUtils.js";
import { resolveRoleId, verboseUserMention } from "../../../utils.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { RoleManagerPlugin } from "../../RoleManager/RoleManagerPlugin.js";
import { rolesCmd } from "../types.js";

export const RemoveTempRoleCmd = rolesCmd({
  trigger: "untemprole",
  permission: "can_assign_temp",
  description: "Remove a timed role from the specified member",
  usage: "!untemprole <user> <role>",

  signature: {
    member: ct.resolvedMember(),
    role: ct.string({ catchAll: true }),
  },

  async run({ message: msg, args, pluginData }) {
    const authorMember = await resolveMessageMember(msg);
    if (!canActOn(pluginData, authorMember, args.member, true)) {
      void pluginData.state.common.sendErrorMessage(
        msg,
        "Cannot remove roles from this user: insufficient permissions",
      );
      return;
    }

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

    const role = (msg.channel as GuildChannel).guild.roles.cache.get(roleId);
    if (!role) {
      pluginData.getPlugin(LogsPlugin).logBotAlert({
        body: `Unknown role configured for 'roles' plugin: ${roleId}`,
      });
      void pluginData.state.common.sendErrorMessage(msg, "You cannot remove that role");
      return;
    }

    const existingTempRole = await pluginData.state.tempRoles.findExistingTempRoleForUserIdAndRoleId(
      args.member.id,
      roleId,
    );
    if (!existingTempRole) {
      void pluginData.state.common.sendErrorMessage(msg, "That member does not have an active timed role for that role");
      return;
    }

    clearExpiringTempRole(existingTempRole);

    if (args.member.roles.cache.has(roleId)) {
      pluginData.getPlugin(RoleManagerPlugin).removeRole(args.member.id, roleId);
    }

    await pluginData.state.tempRoles.clear(args.member.id, roleId);

    pluginData.getPlugin(LogsPlugin).logMemberTimedRoleRemove({
      mod: msg.author,
      member: args.member,
      roles: [role],
      reason: "",
    });

    void pluginData.state.common.sendSuccessMessage(
      msg,
      `Removed timed role **${role.name}** from ${verboseUserMention(args.member.user)}!`,
    );
  },
});
