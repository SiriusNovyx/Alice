import { ChannelType } from "discord.js";
import { slashOptions } from "vety";
import { autoReactionsSlashCmd } from "../types.js";
import { actualNewAutoReactionsCmd } from "./actualNewAutoReactionsCmd.js";

export const NewAutoReactionsSlashCmd = autoReactionsSlashCmd({
  name: "set",
  configPermission: "can_manage",
  description: "Set auto-reactions for a channel",
  allowDms: false,

  signature: [
    slashOptions.channel({
      name: "channel",
      description: "Channel to set auto-reactions on",
      channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread, ChannelType.PrivateThread],
      required: true,
    }),
    slashOptions.string({
      name: "reactions",
      description: "Space-separated emojis to react with",
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

    const reactions = options.reactions.trim().split(/\s+/).filter(Boolean);
    if (!reactions.length) {
      await pluginData.state.common.sendErrorMessage(interaction, "One or more of the specified reactions were invalid!");
      return;
    }

    await actualNewAutoReactionsCmd(pluginData, interaction, channel, reactions);
  },
});
