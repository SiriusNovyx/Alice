import { ChannelType } from "discord.js";
import { slashOptions } from "vety";
import { humanizeDuration } from "../../../humanizeDuration.js";
import { convertDelayStringToMS, DAYS, HOURS, MINUTES } from "../../../utils.js";
import { getMissingChannelPermissions } from "../../../utils/getMissingChannelPermissions.js";
import { missingPermissionError } from "../../../utils/missingPermissionError.js";
import { BOT_SLOWMODE_PERMISSIONS, NATIVE_SLOWMODE_PERMISSIONS } from "../requiredPermissions.js";
import { disableBotSlowmodeForChannel } from "../util/disableBotSlowmodeForChannel.js";
import { slowmodeSlashCmd } from "../types.js";

const MAX_NATIVE_SLOWMODE = 6 * HOURS;
const MAX_BOT_SLOWMODE = DAYS * 365 * 100;
const MIN_BOT_SLOWMODE = 15 * MINUTES;

export const SlowmodeSetSlashCmd = slowmodeSlashCmd({
  name: "slowmode",
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

    const time = convertDelayStringToMS(options.time);
    if (time === null) {
      pluginData.state.common.sendErrorMessage(interaction, `Could not convert "${options.time}" to a duration`);
      return;
    }

    // If time is 0, disable slowmode inline
    if (time === 0) {
      const botSlowmode = await pluginData.state.slowmodes.getChannelSlowmode(channel.id);
      const hasNativeSlowmode = channel.rateLimitPerUser;
      if (!botSlowmode && !hasNativeSlowmode) {
        pluginData.state.common.sendErrorMessage(interaction, "Channel is not on slowmode!");
        return;
      }
      if (botSlowmode) await disableBotSlowmodeForChannel(pluginData, channel);
      if (hasNativeSlowmode) await channel.edit({ rateLimitPerUser: 0 });
      pluginData.state.common.sendSuccessMessage(interaction, "Slowmode disabled!");
      return;
    }

    const config = await pluginData.config.getMatchingConfig({ channelId: channel.id });
    const useNative = config.use_native_slowmode && time <= MAX_NATIVE_SLOWMODE;

    if (useNative) {
      const missingPerms = getMissingChannelPermissions(
        pluginData.guild.members.cache.get(pluginData.client.user!.id)!,
        channel,
        NATIVE_SLOWMODE_PERMISSIONS,
      );
      if (missingPerms) {
        pluginData.state.common.sendErrorMessage(interaction, `Unable to set native slowmode. ${missingPermissionError(missingPerms)}`);
        return;
      }
      const existingBot = await pluginData.state.slowmodes.getChannelSlowmode(channel.id);
      if (existingBot) await disableBotSlowmodeForChannel(pluginData, channel);
      await channel.setRateLimitPerUser(Math.ceil(time / 1000));
    } else {
      if (time > MAX_BOT_SLOWMODE) {
        pluginData.state.common.sendErrorMessage(interaction, "Bot slowmode cannot exceed 100 years");
        return;
      }
      if (time < MIN_BOT_SLOWMODE) {
        pluginData.state.common.sendErrorMessage(interaction, "Bot managed slowmode must be 15min or more");
        return;
      }
      const missingPerms = getMissingChannelPermissions(
        pluginData.guild.members.cache.get(pluginData.client.user!.id)!,
        channel,
        BOT_SLOWMODE_PERMISSIONS,
      );
      if (missingPerms) {
        pluginData.state.common.sendErrorMessage(interaction, `Unable to set bot slowmode. ${missingPermissionError(missingPerms)}`);
        return;
      }
      if (channel.rateLimitPerUser) await channel.setRateLimitPerUser(0);
      await pluginData.state.slowmodes.setChannelSlowmode(channel.id, Math.ceil(time / 1000));
      const slowmode = await pluginData.state.slowmodes.getChannelSlowmode(channel.id);
      pluginData.state.channelSlowmodeCache.set(channel.id, slowmode ?? null);
    }

    const type = useNative ? "native slowmode" : "bot-maintained slowmode";
    pluginData.state.common.sendSuccessMessage(
      interaction,
      `Set ${humanizeDuration(time)} slowmode for <#${channel.id}> (${type})`,
    );
  },
});
