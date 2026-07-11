import { slashOptions } from "vety";
import { rolesSlashCmd } from "../types.js";
import { actualRemoveTempRoleCmd } from "./actualRemoveTempRoleCmd.js";

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

    const role = pluginData.guild.roles.cache.get(options.role.id);
    if (!role) {
      pluginData.state.common.sendErrorMessage(interaction, "You cannot remove that role");
      return;
    }

    await actualRemoveTempRoleCmd(
      pluginData,
      interaction,
      modMember,
      interaction.user,
      member,
      role,
    );
  },
});
