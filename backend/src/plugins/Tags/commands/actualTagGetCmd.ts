import { ChatInputCommandInteraction, Message } from "discord.js";
import { GuildPluginData } from "vety";
import moment from "moment-timezone";
import { getBaseUrl } from "../../../pluginUtils.js";
import { TagsPluginType } from "../types.js";

export async function actualTagGetCmd(
  pluginData: GuildPluginData<TagsPluginType>,
  context: Message | ChatInputCommandInteraction,
  tagName: string,
) {
  const tag = await pluginData.state.tags.find(tagName);
  if (!tag) {
    await pluginData.state.common.sendErrorMessage(context, "No tag with that name");
    return;
  }

  const archiveId = await pluginData.state.archives.create(tag.body, moment.utc().add(10, "minutes"));
  const url = pluginData.state.archives.getUrl(getBaseUrl(pluginData), archiveId);

  await pluginData.state.common.sendSuccessMessage(context, `Tag source:\n${url}`);
}
