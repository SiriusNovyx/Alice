import { slashOptions } from "vety";
import { parseSlashDelay } from "../../../utils.js";
import { rolesSlashCmd } from "../types.js";
import { actualAddTempRoleCmd } from "./actualAddTempRoleCmd.js";

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

    const convertedTime = parseSlashDelay(options.time);
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

    const role = pluginData.guild.roles.cache.get(options.role.id);
    if (!role) {
      pluginData.state.common.sendErrorMessage(interaction, "You cannot assign that role");
      return;
    }

    await actualAddTempRoleCmd(
      pluginData,
      interaction,
      modMember,
      interaction.user,
      member,
      role,
      convertedTime,
      options.reason,
    );
  },
});
