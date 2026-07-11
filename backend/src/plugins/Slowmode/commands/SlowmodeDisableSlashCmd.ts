import { ChannelType } from "discord.js";
import { slashOptions } from "vety";
import { slowmodeSlashCmd } from "../types.js";
import { actualDisableSlowmodeCmd } from "../util/actualDisableSlowmodeCmd.js";

export const SlowmodeDisableSlashCmd = slowmodeSlashCmd({
  name: "disable",
  configPermission: "can_manage",
  description: "Disable slowmode for a channel",
  allowDms: false,

  signature: [
    slashOptions.channel({
      name: "channel",
      description: "The channel to disable slowmode on (defaults to current channel)",
      channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
      required: false,
    }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const channel = (options.channel
      ? pluginData.guild.channels.cache.get(options.channel.id)
      : interaction.channel) as any;

    if (!channel?.isTextBased() || channel.isThread()) {
      pluginData.state.common.sendErrorMessage(interaction, "Cannot disable slowmode on this channel type");
      return;
    }

    await actualDisableSlowmodeCmd(pluginData, interaction, channel);
  },
});
