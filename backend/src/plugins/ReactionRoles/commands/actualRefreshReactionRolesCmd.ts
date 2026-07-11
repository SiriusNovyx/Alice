import { ChatInputCommandInteraction, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { ReactionRolesPluginType } from "../types.js";
import { refreshReactionRoles } from "../util/refreshReactionRoles.js";

export async function actualRefreshReactionRolesCmd(
  pluginData: GuildPluginData<ReactionRolesPluginType>,
  context: Message | ChatInputCommandInteraction,
  channelId: string,
  messageId: string,
) {
  if (pluginData.state.pendingRefreshes.has(`${channelId}-${messageId}`)) {
    await pluginData.state.common.sendErrorMessage(context, "Another refresh in progress");
    return;
  }

  await refreshReactionRoles(pluginData, channelId, messageId);
  await pluginData.state.common.sendSuccessMessage(context, "Reaction roles refreshed");
}
