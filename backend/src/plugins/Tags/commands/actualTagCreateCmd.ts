import { ChatInputCommandInteraction, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { TemplateParseError, parseTemplate } from "../../../templateFormatter.js";
import { TagsPluginType } from "../types.js";

export async function actualTagCreateCmd(
  pluginData: GuildPluginData<TagsPluginType>,
  context: Message | ChatInputCommandInteraction,
  authorId: string,
  tag: string,
  body: string,
) {
  if (tag.length > 50) {
    await pluginData.state.common.sendErrorMessage(context, "Tag name must be 50 characters or less");
    return;
  }
  if (!/^[a-z0-9_-]+$/i.test(tag)) {
    await pluginData.state.common.sendErrorMessage(
      context,
      "Tag name can only contain letters, numbers, hyphens, and underscores (no spaces)",
    );
    return;
  }
  try {
    parseTemplate(body);
  } catch (e) {
    if (e instanceof TemplateParseError) {
      await pluginData.state.common.sendErrorMessage(context, `Invalid tag syntax: ${e.message}`);
      return;
    } else {
      throw e;
    }
  }

  await pluginData.state.tags.createOrUpdate(tag, body, authorId);

  const prefix = pluginData.config.get().prefix;
  await pluginData.state.common.sendSuccessMessage(context, `Tag set! Use it with: \`${prefix}${tag}\``);
}
