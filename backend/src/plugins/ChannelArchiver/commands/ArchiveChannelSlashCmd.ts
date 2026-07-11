import { ChannelType, GuildTextBasedChannel } from "discord.js";
import { slashOptions } from "vety";
import { isOwner } from "../../../pluginUtils.js";
import { channelArchiverSlashCmd } from "../types.js";
import { actualArchiveChannelCmd } from "./actualArchiveChannelCmd.js";

export const ArchiveChannelSlashCmd = channelArchiverSlashCmd({
  name: "archive_channel",
  description: "Archive messages from a channel into a text file (bot owners only)",
  allowDms: false,

  signature: [
    slashOptions.channel({
      name: "channel",
      description: "Channel to archive",
      channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
      required: true,
    }),
    slashOptions.channel({
      name: "attachment-channel",
      description: "Channel to rehost attachments into",
      channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
      required: false,
    }),
    slashOptions.integer({
      name: "messages",
      description: "Max messages to archive (default/max 5000)",
      required: false,
    }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    if (!isOwner(pluginData, interaction.user.id)) {
      await pluginData.state.common.sendErrorMessage(interaction, "Only bot owners can use this command");
      return;
    }

    const channel = pluginData.guild.channels.cache.get(options.channel.id);
    if (!channel?.isTextBased() || channel.isThread()) {
      await pluginData.state.common.sendErrorMessage(interaction, "Invalid channel");
      return;
    }

    let attachmentChannel: GuildTextBasedChannel | null = null;
    if (options["attachment-channel"]) {
      const resolved = pluginData.guild.channels.cache.get(options["attachment-channel"].id);
      if (!resolved?.isTextBased() || resolved.isThread()) {
        await pluginData.state.common.sendErrorMessage(interaction, "Invalid attachment channel");
        return;
      }
      attachmentChannel = resolved;
    }

    await actualArchiveChannelCmd(
      pluginData,
      interaction,
      interaction.user.id,
      channel,
      attachmentChannel,
      options.messages ?? null,
    );
  },
});
