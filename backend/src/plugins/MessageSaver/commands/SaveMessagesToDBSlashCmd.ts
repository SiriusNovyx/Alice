import { ChannelType } from "discord.js";
import { slashOptions } from "vety";
import { messageSaverSlashCmd } from "../types.js";
import { actualSaveMessagesToDBCmd } from "./actualSaveMessagesToDBCmd.js";

export const SaveMessagesToDBSlashCmd = messageSaverSlashCmd({
  name: "messages",
  configPermission: "can_manage",
  description: "Save specific messages to the database permanently",
  allowDms: false,

  signature: [
    slashOptions.channel({
      name: "channel",
      description: "Channel containing the messages",
      channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread, ChannelType.PrivateThread],
      required: true,
    }),
    slashOptions.string({
      name: "message-ids",
      description: "Space-separated message IDs to save",
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

    const ids = options["message-ids"].trim().split(/\s+/).filter(Boolean);
    await actualSaveMessagesToDBCmd(pluginData, interaction, channel, ids);
  },
});
