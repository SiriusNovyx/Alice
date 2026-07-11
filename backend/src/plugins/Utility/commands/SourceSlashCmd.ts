import { ChannelType, GuildTextBasedChannel } from "discord.js";
import { slashOptions } from "vety";
import { utilitySlashCmd } from "../types.js";
import { actualContextCmd } from "./actualContextCmd.js";
import { actualSourceCmd } from "./actualSourceCmd.js";

export const SourceSlashCmd = utilitySlashCmd({
  name: "source",
  configPermission: "can_source",
  description: "View the message source of a message",
  allowDms: false,

  signature: [
    slashOptions.channel({
      name: "channel",
      description: "Channel containing the message",
      channelTypes: [
        ChannelType.GuildText,
        ChannelType.GuildAnnouncement,
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
      ],
      required: true,
    }),
    slashOptions.string({ name: "message-id", description: "Message ID", required: true }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const channel = pluginData.guild.channels.cache.get(options.channel.id);
    if (!channel?.isTextBased() || channel.isDMBased()) {
      await pluginData.state.common.sendErrorMessage(interaction, "Invalid channel");
      return;
    }

    await actualSourceCmd(pluginData, interaction, channel as GuildTextBasedChannel, options["message-id"]);
  },
});

export const ContextSlashCmd = utilitySlashCmd({
  name: "context",
  configPermission: "can_context",
  description: "Get a link to the context of a message",
  allowDms: false,

  signature: [
    slashOptions.channel({
      name: "channel",
      description: "Channel containing the message",
      channelTypes: [
        ChannelType.GuildText,
        ChannelType.GuildAnnouncement,
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
      ],
      required: true,
    }),
    slashOptions.string({ name: "message-id", description: "Message ID", required: true }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const channel = pluginData.guild.channels.cache.get(options.channel.id);
    if (!channel?.isTextBased() || channel.isDMBased()) {
      await pluginData.state.common.sendErrorMessage(interaction, "Channel must be a text channel");
      return;
    }

    await actualContextCmd(pluginData, interaction, channel as GuildTextBasedChannel, options["message-id"]);
  },
});
