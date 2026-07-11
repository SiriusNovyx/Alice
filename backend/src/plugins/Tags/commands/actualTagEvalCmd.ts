import { ChatInputCommandInteraction, GuildMember, Message, MessageCreateOptions, User } from "discord.js";
import { GuildPluginData } from "vety";
import { logger } from "../../../logger.js";
import { TemplateParseError } from "../../../templateFormatter.js";
import { getContextChannel, isContextInteraction, sendContextResponse } from "../../../pluginUtils.js";
import { memberToTemplateSafeMember, userToTemplateSafeUser } from "../../../utils/templateSafeObjects.js";
import { TagsPluginType } from "../types.js";
import { renderTagBody } from "../util/renderTagBody.js";

export async function actualTagEvalCmd(
  pluginData: GuildPluginData<TagsPluginType>,
  context: Message | ChatInputCommandInteraction,
  author: User,
  authorMember: GuildMember,
  body: string,
) {
  try {
    const rendered = (await renderTagBody(
      pluginData,
      body,
      [],
      {
        member: memberToTemplateSafeMember(authorMember),
        user: userToTemplateSafeUser(author),
      },
      { member: authorMember },
    )) as MessageCreateOptions;

    if (!rendered.content && !rendered.embeds?.length) {
      await pluginData.state.common.sendErrorMessage(context, "Evaluation resulted in an empty text");
      return;
    }

    if (isContextInteraction(context)) {
      await sendContextResponse(context, rendered as any, true);
    } else {
      const channel = await getContextChannel(context);
      if (channel?.isSendable()) {
        await channel.send(rendered);
      }
    }
  } catch (e) {
    const errorMessage = e instanceof TemplateParseError ? e.message : "Internal error";

    await pluginData.state.common.sendErrorMessage(context, `Failed to render tag: ${errorMessage}`);

    if (!(e instanceof TemplateParseError)) {
      logger.warn(`Internal error evaluating tag in ${pluginData.guild.id}: ${e}`);
    }
  }
}
