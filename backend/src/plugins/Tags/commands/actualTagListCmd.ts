import escapeStringRegexp from "escape-string-regexp";
import { ChatInputCommandInteraction, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { createChunkedMessage } from "../../../utils.js";
import { getConfigForContext, getContextChannel, isContextInteraction, sendContextResponse } from "../../../pluginUtils.js";
import { TagsPluginType } from "../types.js";

export async function actualTagListCmd(
  pluginData: GuildPluginData<TagsPluginType>,
  context: Message | ChatInputCommandInteraction,
  search?: string | null,
) {
  const tags = await pluginData.state.tags.all();
  if (tags.length === 0) {
    await pluginData.state.common.sendErrorMessage(context, `No tags created yet! Use \`tag create\` command to create one.`);
    return;
  }

  const prefix = (await getConfigForContext(pluginData.config, context)).prefix;
  const tagNames = tags.map((tag) => tag.tag).sort();
  const searchRegex = search ? new RegExp([...search].map((s) => escapeStringRegexp(s)).join(".*"), "i") : null;

  const filteredTags = search ? tagNames.filter((tag) => searchRegex!.test(tag)) : tagNames;

  if (filteredTags.length === 0) {
    await pluginData.state.common.sendErrorMessage(context, "No tags matched the filter");
    return;
  }

  const tagGroups = filteredTags.reduce(
    (obj, tag) => {
      const tagUpper = tag.toUpperCase();
      const key = /[A-Z]/.test(tagUpper[0]) ? tagUpper[0] : "#";
      if (!(key in obj)) {
        obj[key] = [];
      }
      obj[key].push(tag);
      return obj;
    },
    {} as Record<string, string[]>,
  );

  const tagList = Object.keys(tagGroups)
    .sort()
    .map((key) => `[${key}] ${tagGroups[key].join(", ")}`)
    .join("\n");

  const text = `Available tags (use with ${prefix}tag): \`\`\`${tagList}\`\`\``;
  if (isContextInteraction(context)) {
    await sendContextResponse(context, text, true);
  } else {
    const channel = await getContextChannel(context);
    if (channel?.isSendable()) {
      await createChunkedMessage(channel, text);
    }
  }
}
