import { ChatInputCommandInteraction, GuildTextBasedChannel, Message, PermissionsBitField } from "discord.js";
import { GuildPluginData } from "vety";
import { canUseEmoji, customEmojiRegex, isEmoji } from "../../../utils.js";
import { getMissingChannelPermissions } from "../../../utils/getMissingChannelPermissions.js";
import { missingPermissionError } from "../../../utils/missingPermissionError.js";
import { readChannelPermissions } from "../../../utils/readChannelPermissions.js";
import { AutoReactionsPluginType } from "../types.js";

const requiredPermissions = readChannelPermissions | PermissionsBitField.Flags.AddReactions;

export async function actualNewAutoReactionsCmd(
  pluginData: GuildPluginData<AutoReactionsPluginType>,
  context: Message | ChatInputCommandInteraction,
  channel: GuildTextBasedChannel,
  reactions: string[],
) {
  const finalReactions: string[] = [];

  const me = pluginData.guild.members.cache.get(pluginData.client.user!.id)!;
  const missingPermissions = getMissingChannelPermissions(me, channel, requiredPermissions);
  if (missingPermissions) {
    await pluginData.state.common.sendErrorMessage(
      context,
      `Cannot set auto-reactions for that channel. ${missingPermissionError(missingPermissions)}`,
    );
    return;
  }

  for (const reaction of reactions) {
    if (!isEmoji(reaction)) {
      await pluginData.state.common.sendErrorMessage(context, "One or more of the specified reactions were invalid!");
      return;
    }

    let savedValue: string;

    const customEmojiMatch = reaction.match(customEmojiRegex);
    if (customEmojiMatch) {
      if (!canUseEmoji(pluginData.client, customEmojiMatch[2])) {
        await pluginData.state.common.sendErrorMessage(
          context,
          "I can only use regular emojis and custom emojis from this server",
        );
        return;
      }
      savedValue = `${customEmojiMatch[1]}:${customEmojiMatch[2]}`;
    } else {
      savedValue = reaction;
    }

    finalReactions.push(savedValue);
  }

  await pluginData.state.autoReactions.set(channel.id, finalReactions);
  pluginData.state.cache.delete(channel.id);
  await pluginData.state.common.sendSuccessMessage(context, `Auto-reactions set for <#${channel.id}>`);
}
