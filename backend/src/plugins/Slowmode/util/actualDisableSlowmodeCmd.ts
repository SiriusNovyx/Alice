import { AnyThreadChannel, ChatInputCommandInteraction, GuildTextBasedChannel, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { isContextMessage } from "../../../pluginUtils.js";
import { noop } from "../../../utils.js";
import { getMissingChannelPermissions } from "../../../utils/getMissingChannelPermissions.js";
import { missingPermissionError } from "../../../utils/missingPermissionError.js";
import { BOT_SLOWMODE_DISABLE_PERMISSIONS } from "../requiredPermissions.js";
import { SlowmodePluginType } from "../types.js";
import { disableBotSlowmodeForChannel } from "./disableBotSlowmodeForChannel.js";

type SlowmodeChannel = Exclude<GuildTextBasedChannel, AnyThreadChannel>;

export async function actualDisableSlowmodeCmd(
  pluginData: GuildPluginData<SlowmodePluginType>,
  context: Message | ChatInputCommandInteraction,
  channel: SlowmodeChannel,
) {
  const botSlowmode = await pluginData.state.slowmodes.getChannelSlowmode(channel.id);
  const hasNativeSlowmode = channel.rateLimitPerUser;

  if (!botSlowmode && !hasNativeSlowmode) {
    pluginData.state.common.sendErrorMessage(context, "Channel is not on slowmode!");
    return;
  }

  const me =
    pluginData.guild.members.cache.get(pluginData.client.user!.id) ||
    pluginData.guild.members.me ||
    (await pluginData.guild.members.fetchMe());
  const missingPermissions = getMissingChannelPermissions(me, channel, BOT_SLOWMODE_DISABLE_PERMISSIONS);
  if (missingPermissions) {
    pluginData.state.common.sendErrorMessage(
      context,
      `Unable to disable slowmode. ${missingPermissionError(missingPermissions)}`,
    );
    return;
  }

  let initMsg: Message | undefined;
  if (isContextMessage(context)) {
    initMsg = await context.reply("Disabling slowmode...");
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
      context,
      `Slowmode disabled! Failed to clear slowmode from the following users:\n\n<@!${failedUsers.join(">\n<@!")}>`,
    );
  } else {
    pluginData.state.common.sendSuccessMessage(context, "Slowmode disabled!");
    initMsg?.delete().catch(noop);
  }
}
