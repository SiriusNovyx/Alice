import { ChannelType } from "discord.js";
import { slashOptions } from "vety";
import { messageSaverSlashCmd } from "../types.js";
import { actualSavePinsToDBCmd } from "./actualSavePinsToDBCmd.js";

export const SavePinsToDBSlashCmd = messageSaverSlashCmd({
  name: "pins",
  configPermission: "can_manage",
  description: "Save all pinned messages from a channel to the database",
  allowDms: false,

  signature: [
    slashOptions.channel({
      name: "channel",
      description: "Channel whose pins to save",
      channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread, ChannelType.PrivateThread],
      required: true,
    }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const channel = pluginData.guild.channels.cache.get(options.channel.id);
    if (!channel?.isTextBased()) {
      await pluginData.state.common.sendErrorMessage(interaction, "Invalid channel");
      return;
    }

    await actualSavePinsToDBCmd(pluginData, interaction, channel);
  },
});
