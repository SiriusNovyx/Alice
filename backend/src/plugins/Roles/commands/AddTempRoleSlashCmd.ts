import { slashOptions } from "vety";
import { registerExpiringTempRole } from "../../../data/loops/expiringTempRolesLoop.js";
import { humanizeDuration } from "../../../humanizeDuration.js";
import { canActOn } from "../../../pluginUtils.js";
import { convertDelayStringToMS, verboseUserMention } from "../../../utils.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { RoleManagerPlugin } from "../../RoleManager/RoleManagerPlugin.js";
import { rolesSlashCmd } from "../types.js";

export const AddTempRoleSlashCmd = rolesSlashCmd({
  name: "temprole",
  configPermission: "can_assign_temp",
  description: "Add a timed role to the specified member",
  allowDms: false,

  signature: [
    slashOptions.user({ name: "member", description: "The member to add the timed role to", required: true }),
    slashOptions.role({ name: "role", description: "The role to add", required: true }),
    slashOptions.string({ name: "time", description: "How long the role should last", required: true }),
    slashOptions.string({ name: "reason", description: "Reason for the timed role", required: false }),
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

    const convertedTime = convertDelayStringToMS(options.time);
    if (!convertedTime) {
      pluginData.state.common.sendErrorMessage(interaction, `Could not convert ${options.time} to a delay`);
      return;
    }

    const config = await pluginData.config.getMatchingConfig({
      member: modMember,
      channelId: interaction.channelId,
    });
    if (!config.assignable_roles.includes(options.role.id)) {
      pluginData.state.common.sendErrorMessage(interaction, "You cannot assign that role");
      return;
    }

    if (!canActOn(pluginData, modMember, member, true)) {
      pluginData.state.common.sendErrorMessage(interaction, "Cannot add roles to this user: insufficient permissions");
      return;
    }

    const existingTempRole = await pluginData.state.tempRoles.findExistingTempRoleForUserIdAndRoleId(
      member.id,
      options.role.id,
    );

    let tempRole;
    if (existingTempRole) {
      await pluginData.state.tempRoles.updateExpiryTime(member.id, options.role.id, convertedTime, interaction.user.id);
      tempRole = (await pluginData.state.tempRoles.findExistingTempRoleForUserIdAndRoleId(
        member.id,
        options.role.id,
      ))!;
    } else {
      tempRole = await pluginData.state.tempRoles.addTempRole(
        member.id,
        options.role.id,
        convertedTime,
        interaction.user.id,
      );
    }

    if (!member.roles.cache.has(options.role.id)) {
      await pluginData.getPlugin(RoleManagerPlugin).addRole(member.id, options.role.id);
    }

    registerExpiringTempRole(tempRole);

    pluginData.getPlugin(LogsPlugin).logMemberTimedRoleAdd({
      mod: interaction.user,
      member,
      roles: [options.role],
      time: humanizeDuration(convertedTime),
      reason: options.reason ?? "",
    });

    pluginData.state.common.sendSuccessMessage(
      interaction,
      `Added role **${options.role.name}** to ${verboseUserMention(member.user)} for **${humanizeDuration(convertedTime)}**!`,
    );
  },
});
