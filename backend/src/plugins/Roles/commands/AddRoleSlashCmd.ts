import { slashOptions } from "vety";
import { rolesSlashCmd } from "../types.js";
import { actualAddRoleCmd } from "./actualAddRoleCmd.js";

export const AddRoleSlashCmd = rolesSlashCmd({
  name: "add",
  configPermission: "can_assign",
  description: "Add a role to the specified member",
  allowDms: false,

  signature: [
    slashOptions.user({ name: "member", description: "The member to add the role to", required: true }),
    slashOptions.role({ name: "role", description: "The role to add", required: true }),
    slashOptions.string({ name: "reason", description: "Reason for adding the role", required: false }),
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
      pluginData.state.common.sendErrorMessage(interaction, "You cannot assign that role");
      return;
    }

    const role = pluginData.guild.roles.cache.get(options.role.id);
    if (!role) {
      pluginData.state.common.sendErrorMessage(interaction, "You cannot assign that role");
      return;
    }

    await actualAddRoleCmd(
      pluginData,
      interaction,
      modMember,
      interaction.user,
      member,
      role,
      options.reason,
    );
  },
});
