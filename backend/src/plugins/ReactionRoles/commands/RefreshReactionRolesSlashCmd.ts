import { ChannelType } from "discord.js";
import { slashOptions } from "vety";
import { reactionRolesSlashCmd } from "../types.js";
import { actualRefreshReactionRolesCmd } from "./actualRefreshReactionRolesCmd.js";

export const RefreshReactionRolesSlashCmd = reactionRolesSlashCmd({
  name: "refresh",
  configPermission: "can_manage",
  description: "Refresh reaction role emojis on a message",
  allowDms: false,

  signature: [
    slashOptions.channel({
      name: "channel",
      description: "Channel containing the target message",
      channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread, ChannelType.PrivateThread],
      required: true,
    }),
    slashOptions.string({ name: "message-id", description: "ID of the message to refresh", required: true }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    await actualRefreshReactionRolesCmd(
      pluginData,
      interaction,
      options.channel.id,
      options["message-id"],
    );
  },
});
