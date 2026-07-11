import { ChatInputCommandInteraction, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { AutomodPluginType } from "../types.js";

export async function actualViewAntiraidCmd(
  pluginData: GuildPluginData<AutomodPluginType>,
  context: Message | ChatInputCommandInteraction,
) {
  if (pluginData.state.cachedAntiraidLevel) {
    await pluginData.state.common.sendSuccessMessage(
      context,
      `Anti-raid is set to **${pluginData.state.cachedAntiraidLevel}**`,
    );
  } else {
    await pluginData.state.common.sendSuccessMessage(context, `Anti-raid is **off**`);
  }
}
