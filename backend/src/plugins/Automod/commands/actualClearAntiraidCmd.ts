import { ChatInputCommandInteraction, Message, User } from "discord.js";
import { GuildPluginData } from "vety";
import { setAntiraidLevel } from "../functions/setAntiraidLevel.js";
import { AutomodPluginType } from "../types.js";

export async function actualClearAntiraidCmd(
  pluginData: GuildPluginData<AutomodPluginType>,
  context: Message | ChatInputCommandInteraction,
  author: User,
) {
  await setAntiraidLevel(pluginData, null, author);
  await pluginData.state.common.sendSuccessMessage(context, "Anti-raid turned **off**");
}
