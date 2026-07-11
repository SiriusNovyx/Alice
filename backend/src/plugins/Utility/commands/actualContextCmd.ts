import { ChatInputCommandInteraction, GuildTextBasedChannel, Message, Snowflake } from "discord.js";
import { GuildPluginData } from "vety";
import { isContextInteraction, resolveMessageMember, sendContextResponse } from "../../../pluginUtils.js";
import { messageLink } from "../../../utils.js";
import { canReadChannel } from "../../../utils/canReadChannel.js";
import { UtilityPluginType } from "../types.js";

export async function actualContextCmd(
  pluginData: GuildPluginData<UtilityPluginType>,
  context: Message | ChatInputCommandInteraction,
  channel: GuildTextBasedChannel,
  messageId: string,
) {
  const member = isContextInteraction(context)
    ? await pluginData.guild.members.fetch(context.user.id).catch(() => null)
    : await resolveMessageMember(context as Message<true>);

  if (!member || !canReadChannel(channel, member)) {
    await pluginData.state.common.sendErrorMessage(context, "Message context not found");
    return;
  }

  const previousMessages = await channel.messages.fetch({
    limit: 1,
    before: messageId as Snowflake,
  });
  const previousMessage = previousMessages.first();
  if (!previousMessage) {
    await pluginData.state.common.sendErrorMessage(context, "Message context not found");
    return;
  }

  const link = messageLink(pluginData.guild.id, previousMessage.channel.id, previousMessage.id);
  if (isContextInteraction(context)) {
    await sendContextResponse(context, link, false);
  } else if (context.channel.isSendable()) {
    await context.channel.send(link);
  }
}
