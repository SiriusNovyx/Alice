import { ChannelType } from "discord.js";
import { slashOptions } from "vety";
import { parseSlashDelay } from "../../../utils.js";
import { slowmodeSlashCmd } from "../types.js";
import { actualSetSlowmodeCmd } from "../util/actualSetSlowmodeCmd.js";

export const SlowmodeSetSlashCmd = slowmodeSlashCmd({
  name: "set",
  configPermission: "can_manage",
  description: "Set slowmode for a channel (use 0 to disable)",
  allowDms: false,

  signature: [
    slashOptions.string({ name: "time", description: "Duration e.g. 10s, 1m, 1h — or 0 to disable", required: true }),
    slashOptions.channel({
      name: "channel",
      description: "Channel to apply slowmode to (defaults to current)",
      channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
      required: false,
    }),
    slashOptions.string({
      name: "mode",
      description: "Slowmode mode",
      required: false,
      choices: [
        { name: "bot", value: "bot" },
        { name: "native", value: "native" },
      ],
    }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const channel = (options.channel
      ? pluginData.guild.channels.cache.get(options.channel.id)
      : interaction.channel) as any;

    if (!channel?.isTextBased() || channel.isThread()) {
      pluginData.state.common.sendErrorMessage(interaction, "Slowmode can only be set on non-thread text-based channels");
      return;
    }

    const time = parseSlashDelay(options.time);
    if (time === null) {
      pluginData.state.common.sendErrorMessage(interaction, `Could not convert ${options.time} to a delay`);
      return;
    }

    await actualSetSlowmodeCmd(pluginData, interaction, channel, time, options.mode);
  },
});
