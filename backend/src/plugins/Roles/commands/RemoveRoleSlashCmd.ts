import { slashOptions } from "vety";
import { rolesSlashCmd } from "../types.js";
import { actualRemoveRoleCmd } from "./actualRemoveRoleCmd.js";

export const RemoveRoleSlashCmd = rolesSlashCmd({
  name: "remove",
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

    await actualRemoveRoleCmd(pluginData, interaction, modMember, interaction.user, member, role);
  },
});
