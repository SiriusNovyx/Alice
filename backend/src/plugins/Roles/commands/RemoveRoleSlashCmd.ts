import { GuildMember } from "discord.js";
import { slashOptions } from "vety";
import { canActOn } from "../../../pluginUtils.js";
import { verboseUserMention } from "../../../utils.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { RoleManagerPlugin } from "../../RoleManager/RoleManagerPlugin.js";
import { rolesSlashCmd } from "../types.js";

export const RemoveRoleSlashCmd = rolesSlashCmd({
  name: "removerole",
  configPermission: "can_assign",
  description: "Remove a role from the specified member",
  allowDms: false,

  signature: [
    slashOptions.user({ name: "member", description: "The member to remove the role from", required: true }),
    slashOptions.role({ name: "role", description: "The role to remove", required: true }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const member = await pluginData.guild.members.fetch(options.member.id).catch(() => null);
    if (!member) {
      pluginData.state.common.sendErrorMessage(interaction, "Member not found");
      return;
    }

    const config = await pluginData.config.getMatchingConfig({
      member: interaction.member as GuildMember,
      channelId: interaction.channelId,
    });
    if (!config.assignable_roles.includes(options.role.id)) {
      pluginData.state.common.sendErrorMessage(interaction, "You cannot remove that role");
      return;
    }

    if (!canActOn(pluginData, interaction.member as GuildMember, member, true)) {
      pluginData.state.common.sendErrorMessage(interaction, "Cannot remove roles from this user: insufficient permissions");
      return;
    }

    if (!member.roles.cache.has(options.role.id)) {
      pluginData.state.common.sendErrorMessage(interaction, "Member doesn't have that role");
      return;
    }

    await pluginData.getPlugin(RoleManagerPlugin).removeRole(member.id, options.role.id);
    pluginData.getPlugin(LogsPlugin).logMemberRoleRemove({ mod: interaction.user, member, roles: [options.role] });
    pluginData.state.common.sendSuccessMessage(
      interaction,
      `Removed role **${options.role.name}** from ${verboseUserMention(member.user)}!`,
    );
  },
});
