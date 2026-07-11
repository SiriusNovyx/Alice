import { ChatInputCommandInteraction, GuildTextBasedChannel, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { getBaseUrl, isContextInteraction, resolveMessageMember } from "../../../pluginUtils.js";
import moment from "moment-timezone";
import { canReadChannel } from "../../../utils/canReadChannel.js";
import { UtilityPluginType } from "../types.js";

export async function actualSourceCmd(
  pluginData: GuildPluginData<UtilityPluginType>,
  context: Message | ChatInputCommandInteraction,
  channel: GuildTextBasedChannel,
  messageId: string,
) {
  const member = isContextInteraction(context)
    ? await pluginData.guild.members.fetch(context.user.id).catch(() => null)
    : await resolveMessageMember(context as Message<true>);

  if (!member || !canReadChannel(channel, member)) {
    await pluginData.state.common.sendErrorMessage(context, "Unknown message");
    return;
  }

  const message = await channel.messages.fetch(messageId).catch(() => null);
  if (!message) {
    await pluginData.state.common.sendErrorMessage(context, "Unknown message");
    return;
  }

  const textSource = message.content || "<no text content>";
  const fullSource = JSON.stringify({
    id: message.id,
    content: message.content,
    attachments: message.attachments,
    embeds: message.embeds,
    stickers: message.stickers,
  });

  const source = `${textSource}\n\nSource:\n\n${fullSource}`;
  const archiveId = await pluginData.state.archives.create(source, moment.utc().add(1, "hour"));
  const baseUrl = getBaseUrl(pluginData);
  const url = pluginData.state.archives.getUrl(baseUrl, archiveId);

  if (isContextInteraction(context)) {
    await context.editReply(`Message source: ${url}`);
  } else if (context.channel.isSendable()) {
    await context.channel.send(`Message source: ${url}`);
  }
}
