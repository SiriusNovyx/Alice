import { ChannelType, Snowflake } from "discord.js";
import { slashOptions } from "vety";
import { cleanMessages } from "../functions/cleanMessages.js";
import { fetchChannelMessagesToClean } from "../functions/fetchChannelMessagesToClean.js";
import { utilitySlashCmd } from "../types.js";

export const CleanSlashCmd = utilitySlashCmd({
  name: "clean",
  configPermission: "can_clean",
  description: "Remove a number of recent messages",
  allowDms: false,

  signature: [
    slashOptions.integer({ name: "count", description: "Number of messages to delete (max 100)", required: true }),
    slashOptions.user({ name: "user", description: "Only delete messages from this user", required: false }),
    slashOptions.channel({
      name: "channel",
      description: "The channel to clean (defaults to current channel)",
      channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread, ChannelType.PrivateThread],
      required: false,
    }),
    slashOptions.boolean({ name: "bots", description: "Only delete bot messages", required: false }),
    slashOptions.boolean({ name: "delete-pins", description: "Also delete pinned messages", required: false }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const targetChannel = options.channel
      ? pluginData.guild.channels.cache.get(options.channel.id as Snowflake)
      : interaction.channel;

    if (!targetChannel?.isTextBased()) {
      pluginData.state.common.sendErrorMessage(interaction, "Invalid channel");
      return;
    }

    const fetchResult = await fetchChannelMessagesToClean(pluginData, targetChannel as any, {
      beforeId: interaction.id,
      count: Math.min(options.count, 100),
      authorId: options.user?.id,
      includePins: options["delete-pins"] ?? false,
      onlyBotMessages: options.bots ?? false,
      onlyWithInvites: false,
      upToId: undefined,
      matchContent: undefined,
    });

    if ("error" in fetchResult) {
      pluginData.state.common.sendErrorMessage(interaction, fetchResult.error);
      return;
    }

    const { messages: toClean, note } = fetchResult;

    if (toClean.length === 0) {
      pluginData.state.common.sendErrorMessage(interaction, `Found no messages to clean${note ? ` (${note})` : ""}!`);
      return;
    }

    const result = await cleanMessages(pluginData, targetChannel as any, toClean, interaction.user);
    let responseText = `Cleaned ${toClean.length} ${toClean.length === 1 ? "message" : "messages"}`;
    if (note) responseText += ` (${note})`;
    if (targetChannel.id !== interaction.channelId) responseText += ` in <#${targetChannel.id}>: ${result.archiveUrl}`;

    pluginData.state.common.sendSuccessMessage(interaction, responseText);
  },
});
