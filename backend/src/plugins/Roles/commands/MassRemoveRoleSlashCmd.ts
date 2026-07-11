import { slashOptions } from "vety";
import { rolesSlashCmd } from "../types.js";
import { actualMassRemoveRoleCmd } from "./actualMassRemoveRoleCmd.js";

export const MassRemoveRoleSlashCmd = rolesSlashCmd({
  name: "massremove",
  configPermission: "can_mass_assign",
  description: "Remove a role from multiple members",
  allowDms: false,

  signature: [
    slashOptions.role({ name: "role", description: "The role to remove", required: true }),
    slashOptions.string({ name: "user-ids", description: "Space/comma-separated list of user IDs", required: true }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

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

    await actualMassRemoveRoleCmd(
      pluginData,
      interaction,
      modMember,
      interaction.user,
      role,
      options["user-ids"].split(/\D+/),
    );
  },
});
