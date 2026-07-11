import { ChannelType } from "discord.js";
import { slashOptions } from "vety";
import { pingableRolesSlashCmd } from "../types.js";
import { actualPingableRoleEnableCmd } from "./actualPingableRoleEnableCmd.js";

export const PingableRoleEnableSlashCmd = pingableRolesSlashCmd({
  name: "enable",
  configPermission: "can_manage",
  description: "Make a role pingable in a channel",
  allowDms: false,

  signature: [
    slashOptions.channel({
      name: "channel",
      description: "Channel where the role should be pingable",
      channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread, ChannelType.PrivateThread],
      required: true,
    }),
    slashOptions.role({ name: "role", description: "Role to make pingable", required: true }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const role = pluginData.guild.roles.cache.get(options.role.id);
    if (!role) {
      await pluginData.state.common.sendErrorMessage(interaction, "Role not found");
      return;
    }

    await actualPingableRoleEnableCmd(pluginData, interaction, options.channel.id, role);
  },
});
