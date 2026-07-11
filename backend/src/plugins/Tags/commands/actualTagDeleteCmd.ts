import { ChatInputCommandInteraction, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { TagsPluginType } from "../types.js";

export async function actualTagDeleteCmd(
  pluginData: GuildPluginData<TagsPluginType>,
  context: Message | ChatInputCommandInteraction,
  tagName: string,
) {
  const tag = await pluginData.state.tags.find(tagName);
  if (!tag) {
    await pluginData.state.common.sendErrorMessage(context, "No tag with that name");
    return;
  }

  await pluginData.state.tags.delete(tagName);
  await pluginData.state.common.sendSuccessMessage(context, "Tag deleted!");
}
