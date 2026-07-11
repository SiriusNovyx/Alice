import { ChatInputCommandInteraction, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { AutoReactionsPluginType } from "../types.js";

export async function actualDisableAutoReactionsCmd(
  pluginData: GuildPluginData<AutoReactionsPluginType>,
  context: Message | ChatInputCommandInteraction,
  channelId: string,
) {
  const autoReaction = await pluginData.state.autoReactions.getForChannel(channelId);
  if (!autoReaction) {
    await pluginData.state.common.sendErrorMessage(context, `Auto-reactions aren't enabled in <#${channelId}>`);
    return;
  }

  await pluginData.state.autoReactions.removeFromChannel(channelId);
  pluginData.state.cache.delete(channelId);
  await pluginData.state.common.sendSuccessMessage(context, `Auto-reactions disabled in <#${channelId}>`);
}
