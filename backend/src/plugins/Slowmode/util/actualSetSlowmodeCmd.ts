import {
  AnyThreadChannel,
  ChatInputCommandInteraction,
  escapeInlineCode,
  GuildTextBasedChannel,
  Message,
  PermissionsBitField,
} from "discord.js";
import { GuildPluginData } from "vety";
import { humanizeDuration } from "../../../humanizeDuration.js";
import { asSingleLine, DAYS, HOURS, MINUTES } from "../../../utils.js";
import { getMissingPermissions } from "../../../utils/getMissingPermissions.js";
import { missingPermissionError } from "../../../utils/missingPermissionError.js";
import { BOT_SLOWMODE_PERMISSIONS, NATIVE_SLOWMODE_PERMISSIONS } from "../requiredPermissions.js";
import { SlowmodePluginType } from "../types.js";
import { actualDisableSlowmodeCmd } from "./actualDisableSlowmodeCmd.js";
import { disableBotSlowmodeForChannel } from "./disableBotSlowmodeForChannel.js";

const MAX_NATIVE_SLOWMODE = 6 * HOURS;
const MAX_BOT_SLOWMODE = DAYS * 365 * 100;
const MIN_BOT_SLOWMODE = 15 * MINUTES;

const validModes = ["bot", "native"] as const;
type TMode = (typeof validModes)[number];
type SlowmodeChannel = Exclude<GuildTextBasedChannel, AnyThreadChannel>;

export async function actualSetSlowmodeCmd(
  pluginData: GuildPluginData<SlowmodePluginType>,
  context: Message | ChatInputCommandInteraction,
  channel: SlowmodeChannel,
  timeMs: number,
  modeArg?: string | null,
) {
  if (!channel.isTextBased() || channel.isThread()) {
    pluginData.state.common.sendErrorMessage(context, "Slowmode can only be set on non-thread text-based channels");
    return;
  }

  if (timeMs === 0) {
    return actualDisableSlowmodeCmd(pluginData, context, channel);
  }

  const defaultMode: TMode =
    (await pluginData.config.getForChannel(channel)).use_native_slowmode && timeMs <= MAX_NATIVE_SLOWMODE
      ? "native"
      : "bot";

  const mode = (modeArg as TMode) || defaultMode;
  if (!validModes.includes(mode)) {
    pluginData.state.common.sendErrorMessage(context, "--mode must be 'bot' or 'native'");
    return;
  }

  if (mode === "native" && timeMs > MAX_NATIVE_SLOWMODE) {
    pluginData.state.common.sendErrorMessage(context, "Native slowmode can only be set to 6h or less");
    return;
  }

  if (mode === "bot" && timeMs > MAX_BOT_SLOWMODE) {
    pluginData.state.common.sendErrorMessage(
      context,
      `Sorry, bot managed slowmodes can be at most 100 years long. Maybe 99 would be enough?`,
    );
    return;
  }

  if (mode === "bot" && timeMs < MIN_BOT_SLOWMODE) {
    pluginData.state.common.sendErrorMessage(
      context,
      asSingleLine(`
        Bot managed slowmode must be 15min or more.
        Use \`--mode native\` to use native slowmodes for short slowmodes instead.
      `),
    );
    return;
  }

  const channelPermissions = channel.permissionsFor(pluginData.client.user!.id);

  if (mode === "native") {
    const missingPermissions = getMissingPermissions(
      channelPermissions ?? new PermissionsBitField(),
      NATIVE_SLOWMODE_PERMISSIONS,
    );
    if (missingPermissions) {
      pluginData.state.common.sendErrorMessage(
        context,
        `Unable to set native slowmode. ${missingPermissionError(missingPermissions)}`,
      );
      return;
    }
  }

  if (mode === "bot") {
    const missingPermissions = getMissingPermissions(
      channelPermissions ?? new PermissionsBitField(),
      BOT_SLOWMODE_PERMISSIONS,
    );
    if (missingPermissions) {
      pluginData.state.common.sendErrorMessage(
        context,
        `Unable to set bot managed slowmode. ${missingPermissionError(missingPermissions)}`,
      );
      return;
    }
  }

  const rateLimitSeconds = Math.ceil(timeMs / 1000);

  if (mode === "native") {
    const existingBotSlowmode = await pluginData.state.slowmodes.getChannelSlowmode(channel.id);
    if (existingBotSlowmode && channel.isTextBased()) {
      await disableBotSlowmodeForChannel(pluginData, channel);
    }

    try {
      await channel.setRateLimitPerUser(rateLimitSeconds);
    } catch (e) {
      pluginData.state.common.sendErrorMessage(
        context,
        `Failed to set native slowmode: ${escapeInlineCode(e.message)}`,
      );
      return;
    }
  } else {
    if (channel.rateLimitPerUser) {
      await channel.setRateLimitPerUser(0);
    }

    await pluginData.state.slowmodes.setChannelSlowmode(channel.id, rateLimitSeconds);

    const slowmode = await pluginData.state.slowmodes.getChannelSlowmode(channel.id);
    pluginData.state.channelSlowmodeCache.set(channel.id, slowmode ?? null);
  }

  const humanizedSlowmodeTime = humanizeDuration(timeMs);
  const slowmodeType = mode === "native" ? "native slowmode" : "bot-maintained slowmode";
  pluginData.state.common.sendSuccessMessage(
    context,
    `Set ${humanizedSlowmodeTime} slowmode for <#${channel.id}> (${slowmodeType})`,
  );
}
