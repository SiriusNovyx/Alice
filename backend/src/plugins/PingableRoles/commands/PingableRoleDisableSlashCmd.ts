import { ChannelType } from "discord.js";
import { slashOptions } from "vety";
import { pingableRolesSlashCmd } from "../types.js";
import { actualPingableRoleDisableCmd } from "./actualPingableRoleDisableCmd.js";

export const PingableRoleDisableSlashCmd = pingableRolesSlashCmd({
  name: "disable",
  configPermission: "can_manage",
  description: "Stop a role from being pingable in a channel",
  allowDms: false,

  signature: [
    slashOptions.channel({
      name: "channel",
      description: "Channel where the role should no longer be pingable",
      channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread, ChannelType.PrivateThread],
      required: true,
    }),
    slashOptions.role({ name: "role", description: "Role to disable", required: true }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const role = pluginData.guild.roles.cache.get(options.role.id);
    if (!role) {
      await pluginData.state.common.sendErrorMessage(interaction, "Role not found");
      return;
    }

    await actualPingableRoleDisableCmd(pluginData, interaction, options.channel.id, role);
  },
});
