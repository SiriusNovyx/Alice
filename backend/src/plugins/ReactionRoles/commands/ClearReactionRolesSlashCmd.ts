import { ChannelType } from "discord.js";
import { slashOptions } from "vety";
import { reactionRolesSlashCmd } from "../types.js";
import { actualClearReactionRolesCmd } from "./actualClearReactionRolesCmd.js";

export const ClearReactionRolesSlashCmd = reactionRolesSlashCmd({
  name: "clear",
  configPermission: "can_manage",
  description: "Clear reaction roles from a message",
  allowDms: false,

  signature: [
    slashOptions.channel({
      name: "channel",
      description: "Channel containing the target message",
      channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread, ChannelType.PrivateThread],
      required: true,
    }),
    slashOptions.string({ name: "message-id", description: "ID of the message to clear", required: true }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const channel = pluginData.guild.channels.cache.get(options.channel.id);
    if (!channel?.isTextBased()) {
      await pluginData.state.common.sendErrorMessage(interaction, "Invalid channel");
      return;
    }

    await actualClearReactionRolesCmd(pluginData, interaction, channel, options["message-id"]);
  },
});
