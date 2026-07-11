import { ChannelType } from "discord.js";
import { slashOptions } from "vety";
import { autoReactionsSlashCmd } from "../types.js";
import { actualDisableAutoReactionsCmd } from "./actualDisableAutoReactionsCmd.js";

export const DisableAutoReactionsSlashCmd = autoReactionsSlashCmd({
  name: "disable",
  configPermission: "can_manage",
  description: "Disable auto-reactions in a channel",
  allowDms: false,

  signature: [
    slashOptions.channel({
      name: "channel",
      description: "Channel to disable auto-reactions in",
      channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread, ChannelType.PrivateThread],
      required: true,
    }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualDisableAutoReactionsCmd(pluginData, interaction, options.channel.id);
  },
});
