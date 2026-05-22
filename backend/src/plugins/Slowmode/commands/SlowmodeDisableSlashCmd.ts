import { ChannelType } from "discord.js";
import { slashOptions } from "vety";
import { getMissingChannelPermissions } from "../../../utils/getMissingChannelPermissions.js";
import { missingPermissionError } from "../../../utils/missingPermissionError.js";
import { BOT_SLOWMODE_DISABLE_PERMISSIONS } from "../requiredPermissions.js";
import { disableBotSlowmodeForChannel } from "../util/disableBotSlowmodeForChannel.js";
import { slowmodeSlashCmd } from "../types.js";

export const SlowmodeDisableSlashCmd = slowmodeSlashCmd({
  name: "slowmode-disable",
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

    const botSlowmode = await pluginData.state.slowmodes.getChannelSlowmode(channel.id);
    const hasNativeSlowmode = channel.rateLimitPerUser;

    if (!botSlowmode && !hasNativeSlowmode) {
      pluginData.state.common.sendErrorMessage(interaction, "Channel is not on slowmode!");
      return;
    }

    const me = pluginData.guild.members.cache.get(pluginData.client.user!.id);
    const missingPermissions = getMissingChannelPermissions(me!, channel, BOT_SLOWMODE_DISABLE_PERMISSIONS);
    if (missingPermissions) {
      pluginData.state.common.sendErrorMessage(
        interaction,
        `Unable to disable slowmode. ${missingPermissionError(missingPermissions)}`,
      );
      return;
    }

    let failedUsers: string[] = [];
    if (botSlowmode) {
      const result = await disableBotSlowmodeForChannel(pluginData, channel);
      failedUsers = result.failedUsers;
    }

    if (hasNativeSlowmode) {
      await channel.edit({ rateLimitPerUser: 0 });
    }

    if (failedUsers.length) {
      pluginData.state.common.sendSuccessMessage(
        interaction,
        `Slowmode disabled! Failed to clear slowmode from:\n<@!${failedUsers.join(">\n<@!")}>`,
      );
    } else {
      pluginData.state.common.sendSuccessMessage(interaction, "Slowmode disabled!");
    }
  },
});
