import { GuildChannel } from "discord.js";
import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { registerExpiringTempRole } from "../../../data/loops/expiringTempRolesLoop.js";
import { humanizeDuration } from "../../../humanizeDuration.js";
import { canActOn, resolveMessageMember } from "../../../pluginUtils.js";
import { resolveRoleId, verboseUserMention } from "../../../utils.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { RoleManagerPlugin } from "../../RoleManager/RoleManagerPlugin.js";
import { rolesCmd } from "../types.js";

export const AddTempRoleCmd = rolesCmd({
  trigger: "temprole",
  permission: "can_assign_temp",
  description: "Add a timed role to the specified member",
  usage: "!temprole <user> <role> <duration> [reason]",

  signature: {
    member: ct.resolvedMember(),
    role: ct.string(),
    time: ct.delay(),
    reason: ct.string({ required: false, catchAll: true }),
  },

  async run({ message: msg, args, pluginData }) {
    const authorMember = await resolveMessageMember(msg);
    if (!canActOn(pluginData, authorMember, args.member, true)) {
      void pluginData.state.common.sendErrorMessage(msg, "Cannot add roles to this user: insufficient permissions");
      return;
    }

    const roleId = await resolveRoleId(pluginData.client, pluginData.guild.id, args.role);
    if (!roleId) {
      void pluginData.state.common.sendErrorMessage(msg, "Invalid role id");
      return;
    }

    const config = await pluginData.config.getForMessage(msg);
    if (!config.assignable_roles.includes(roleId)) {
      void pluginData.state.common.sendErrorMessage(msg, "You cannot assign that role");
      return;
    }

    const role = (msg.channel as GuildChannel).guild.roles.cache.get(roleId);
    if (!role) {
      pluginData.getPlugin(LogsPlugin).logBotAlert({
        body: `Unknown role configured for 'roles' plugin: ${roleId}`,
      });
      void pluginData.state.common.sendErrorMessage(msg, "You cannot assign that role");
      return;
    }

    const existingTempRole = await pluginData.state.tempRoles.findExistingTempRoleForUserIdAndRoleId(
      args.member.id,
      roleId,
    );

    let tempRole;
    if (existingTempRole) {
      await pluginData.state.tempRoles.updateExpiryTime(args.member.id, roleId, args.time, msg.author.id);
      tempRole = (await pluginData.state.tempRoles.findExistingTempRoleForUserIdAndRoleId(args.member.id, roleId))!;
    } else {
      tempRole = await pluginData.state.tempRoles.addTempRole(args.member.id, roleId, args.time, msg.author.id);
    }

    if (!args.member.roles.cache.has(roleId)) {
      pluginData.getPlugin(RoleManagerPlugin).addRole(args.member.id, roleId);
    }

    registerExpiringTempRole(tempRole);

    pluginData.getPlugin(LogsPlugin).logMemberTimedRoleAdd({
      mod: msg.author,
      member: args.member,
      roles: [role],
      time: humanizeDuration(args.time),
      reason: args.reason ?? "",
    });

    void pluginData.state.common.sendSuccessMessage(
      msg,
      `Added role **${role.name}** to ${verboseUserMention(args.member.user)} for **${humanizeDuration(args.time)}**!`,
    );
  },
});
