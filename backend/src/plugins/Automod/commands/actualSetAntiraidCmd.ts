import { ChatInputCommandInteraction, Message, User } from "discord.js";
import { GuildPluginData } from "vety";
import { setAntiraidLevel } from "../functions/setAntiraidLevel.js";
import { AutomodPluginType } from "../types.js";

export async function actualSetAntiraidCmd(
  pluginData: GuildPluginData<AutomodPluginType>,
  context: Message | ChatInputCommandInteraction,
  author: User,
  level: string,
) {
  const config = pluginData.config.get();
  if (!config.antiraid_levels.includes(level)) {
    await pluginData.state.common.sendErrorMessage(context, "Unknown anti-raid level");
    return;
  }

  await setAntiraidLevel(pluginData, level, author);
  await pluginData.state.common.sendSuccessMessage(context, `Anti-raid level set to **${level}**`);
}
