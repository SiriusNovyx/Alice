import { ChatInputCommandInteraction, GuildTextBasedChannel, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { isDiscordAPIError } from "../../../utils.js";
import { ReactionRolesPluginType } from "../types.js";

export async function actualClearReactionRolesCmd(
  pluginData: GuildPluginData<ReactionRolesPluginType>,
  context: Message | ChatInputCommandInteraction,
  channel: GuildTextBasedChannel,
  messageId: string,
) {
  const existingReactionRoles = await pluginData.state.reactionRoles.getForMessage(messageId);
  if (!existingReactionRoles.length) {
    await pluginData.state.common.sendErrorMessage(context, "Message doesn't have reaction roles on it");
    return;
  }

  await pluginData.state.reactionRoles.removeFromMessage(messageId);

  let targetMessage: Message;
  try {
    targetMessage = await channel.messages.fetch(messageId);
  } catch (err) {
    if (isDiscordAPIError(err) && err.code === 50001) {
      await pluginData.state.common.sendErrorMessage(context, "Missing access to the specified message");
      return;
    }
    throw err;
  }

  await targetMessage.reactions.removeAll();
  await pluginData.state.common.sendSuccessMessage(context, "Reaction roles cleared");
}
