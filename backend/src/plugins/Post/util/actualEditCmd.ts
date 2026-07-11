import { APIEmbed, ChatInputCommandInteraction, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { isValidEmbed } from "../../../utils.js";
import { parseColor } from "../../../utils/parseColor.js";
import { rgbToInt } from "../../../utils/rgbToInt.js";
import { PostPluginType } from "../types.js";
import { formatContent } from "./formatContent.js";

export async function actualEditCmd(
  pluginData: GuildPluginData<PostPluginType>,
  context: Message | ChatInputCommandInteraction,
  channelId: string,
  messageId: string,
  content: string,
) {
  const channel = pluginData.guild.channels.cache.get(channelId);
  if (!channel?.isTextBased()) {
    await pluginData.state.common.sendErrorMessage(context, "Unknown message");
    return;
  }

  const targetMessage = await channel.messages.fetch(messageId).catch(() => null);
  if (!targetMessage) {
    await pluginData.state.common.sendErrorMessage(context, "Unknown message");
    return;
  }

  if (targetMessage.author.id !== pluginData.client.user!.id) {
    await pluginData.state.common.sendErrorMessage(context, "Message wasn't posted by me");
    return;
  }

  await targetMessage.channel.messages.edit(targetMessage.id, {
    content: formatContent(content),
  });
  await pluginData.state.common.sendSuccessMessage(context, "Message edited");
}

export async function actualEditEmbedCmd(
  pluginData: GuildPluginData<PostPluginType>,
  context: Message | ChatInputCommandInteraction,
  channelId: string,
  messageId: string,
  opts: {
    title?: string | null;
    content?: string | null;
    color?: string | null;
    raw?: boolean;
  },
) {
  let color: number | null = null;
  if (opts.color) {
    const colorRgb = parseColor(opts.color);
    if (colorRgb) {
      color = rgbToInt(colorRgb);
    } else {
      await pluginData.state.common.sendErrorMessage(context, "Invalid color specified");
      return;
    }
  }

  const channel = pluginData.guild.channels.cache.get(channelId);
  if (!channel?.isTextBased()) {
    await pluginData.state.common.sendErrorMessage(context, "Unknown message");
    return;
  }

  const targetMessage = await channel.messages.fetch(messageId).catch(() => null);
  if (!targetMessage) {
    await pluginData.state.common.sendErrorMessage(context, "Unknown message");
    return;
  }

  let embed: APIEmbed = targetMessage.embeds![0]?.toJSON() ?? { fields: [] };
  if (opts.title) embed.title = opts.title;
  if (color) embed.color = color;

  if (opts.content) {
    if (opts.raw) {
      let parsed;
      try {
        parsed = JSON.parse(opts.content);
      } catch (e: any) {
        await pluginData.state.common.sendErrorMessage(context, `Syntax error in embed JSON: ${e.message}`);
        return;
      }

      if (!isValidEmbed(parsed)) {
        await pluginData.state.common.sendErrorMessage(context, "Embed is not valid");
        return;
      }

      embed = Object.assign({}, embed, parsed);
    } else {
      embed.description = formatContent(opts.content);
    }
  }

  await channel.messages.edit(targetMessage.id, { embeds: [embed] });
  await pluginData.state.common.sendSuccessMessage(context, "Embed edited");
}
