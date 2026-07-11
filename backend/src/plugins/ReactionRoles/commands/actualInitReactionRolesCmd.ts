import { ChatInputCommandInteraction, GuildMember, GuildTextBasedChannel, Message, Snowflake } from "discord.js";
import { GuildPluginData } from "vety";
import { canUseEmoji, isDiscordAPIError, isValidEmoji, noop, trimPluginDescription } from "../../../utils.js";
import { canReadChannel } from "../../../utils/canReadChannel.js";
import { ReactionRolesPluginType, TReactionRolePair } from "../types.js";
import { applyReactionRoleReactionsToMessage } from "../util/applyReactionRoleReactionsToMessage.js";

const CLEAR_ROLES_EMOJI = "❌";

export const INIT_REACTION_ROLES_DESCRIPTION = trimPluginDescription(`
  This command allows you to add reaction roles to a given message.
  Provide emoji = roleId pairs (one per line).
  If the message is not found, use save_messages_to_db to store it first.
`);

export async function actualInitReactionRolesCmd(
  pluginData: GuildPluginData<ReactionRolesPluginType>,
  context: Message | ChatInputCommandInteraction,
  member: GuildMember,
  channel: GuildTextBasedChannel,
  messageId: string,
  reactionRolePairs: string,
  exclusive: boolean,
) {
  if (!canReadChannel(channel, member)) {
    await pluginData.state.common.sendErrorMessage(
      context,
      "You can't add reaction roles to channels you can't see yourself",
    );
    return;
  }

  let targetMessage: Message;
  try {
    targetMessage = await channel.messages.fetch(messageId);
  } catch (e) {
    if (isDiscordAPIError(e)) {
      await pluginData.state.common.sendErrorMessage(context, `Error ${e.code} while getting message: ${e.message}`);
      return;
    }
    throw e;
  }

  await pluginData.state.reactionRoles.removeFromMessage(targetMessage.id);

  const emojiRolePairs: TReactionRolePair[] = reactionRolePairs
    .trim()
    .split("\n")
    .map((v) => v.split(/[\s=,]+/).map((part) => part.trim()))
    .map((pair): TReactionRolePair => {
      const customEmojiMatch = pair[0].match(/^<a?:(.*?):(\d+)>$/);
      if (customEmojiMatch) {
        return [customEmojiMatch[2], pair[1], customEmojiMatch[1]];
      }
      return pair as TReactionRolePair;
    });

  for (const pair of emojiRolePairs) {
    if (pair[0] === CLEAR_ROLES_EMOJI) {
      await pluginData.state.common.sendErrorMessage(
        context,
        `The emoji for clearing roles (${CLEAR_ROLES_EMOJI}) is reserved and cannot be used`,
      );
      return;
    }

    if (!isValidEmoji(pair[0])) {
      await pluginData.state.common.sendErrorMessage(context, `Invalid emoji: ${pair[0]}`);
      return;
    }

    if (!canUseEmoji(pluginData.client, pair[0])) {
      await pluginData.state.common.sendErrorMessage(
        context,
        "I can only use regular emojis and custom emojis from servers I'm on",
      );
      return;
    }

    if (!pluginData.guild.roles.cache.has(pair[1] as Snowflake)) {
      await pluginData.state.common.sendErrorMessage(context, `Unknown role ${pair[1]}`);
      return;
    }
  }

  const progressMessage =
    context instanceof Message && context.channel.isSendable()
      ? context.channel.send("Adding reaction roles...")
      : Promise.resolve(null);

  let pos = 0;
  for (const pair of emojiRolePairs) {
    await pluginData.state.reactionRoles.add(channel.id, targetMessage.id, pair[0], pair[1], exclusive, pos);
    pos++;
  }

  const reactionRoles = await pluginData.state.reactionRoles.getForMessage(targetMessage.id);
  const errors = await applyReactionRoleReactionsToMessage(
    pluginData,
    targetMessage.channel.id,
    targetMessage.id,
    reactionRoles,
  );

  if (errors?.length) {
    await pluginData.state.common.sendErrorMessage(context, `Errors while adding reaction roles:\n${errors.join("\n")}`);
  } else {
    await pluginData.state.common.sendSuccessMessage(context, "Reaction roles added");
  }

  const progress = await progressMessage;
  progress?.delete().catch(noop);
}
