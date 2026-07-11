import { slashOptions } from "vety";
import { clearExpiringTempRole } from "../../../data/loops/expiringTempRolesLoop.js";
import { canActOn } from "../../../pluginUtils.js";
import { convertDelayStringToMS, resolveRoleId, verboseUserMention } from "../../../utils.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { RoleManagerPlugin } from "../../RoleManager/RoleManagerPlugin.js";
import { rolesSlashCmd } from "../types.js";

export const RemoveTempRoleSlashCmd = rolesSlashCmd({
  name: "untemprole",
  configPermission: "can_assign_temp",
  description: "Remove a timed role from the specified member",
  allowDms: false,

  signature: [
    slashOptions.user({ name: "member", description: "The member to remove the timed role from", required: true }),
    slashOptions.role({ name: "role", description: "The timed role to remove", required: true }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const member = await pluginData.guild.members.fetch(options.member.id).catch(() => null);
    if (!member) {
      pluginData.state.common.sendErrorMessage(interaction, "Member not found");
      return;
    }

    const modMember = await pluginData.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!modMember) {
      pluginData.state.common.sendErrorMessage(interaction, "Failed to resolve your member info");
      return;
    }

    const config = await pluginData.config.getMatchingConfig({
      member: modMember,
      channelId: interaction.channelId,
    });
    if (!config.assignable_roles.includes(options.role.id)) {
      pluginData.state.common.sendErrorMessage(interaction, "You cannot remove that role");
      return;
    }

    if (!canActOn(pluginData, modMember, member, true)) {
      pluginData.state.common.sendErrorMessage(
        interaction,
        "Cannot remove roles from this user: insufficient permissions",
      );
      return;
    }

    const existingTempRole = await pluginData.state.tempRoles.findExistingTempRoleForUserIdAndRoleId(
      member.id,
      options.role.id,
    );
    if (!existingTempRole) {
      pluginData.state.common.sendErrorMessage(interaction, "That member does not have an active timed role for that role");
      return;
    }

    clearExpiringTempRole(existingTempRole);

    if (member.roles.cache.has(options.role.id)) {
      await pluginData.getPlugin(RoleManagerPlugin).removeRole(member.id, options.role.id);
    }

    await pluginData.state.tempRoles.clear(member.id, options.role.id);

    pluginData.getPlugin(LogsPlugin).logMemberTimedRoleRemove({
      mod: interaction.user,
      member,
      roles: [options.role],
      reason: "",
    });

    pluginData.state.common.sendSuccessMessage(
      interaction,
      `Removed timed role **${options.role.name}** from ${verboseUserMention(member.user)}!`,
    );
  },
});
