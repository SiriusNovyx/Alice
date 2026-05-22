import { Attachment, ChatInputCommandInteraction, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { isContextMessage } from "../../../pluginUtils.js";
import { ModActionsPluginType } from "../types.js";

export async function formatReasonWithMessageLinkForAttachments(
  pluginData: GuildPluginData<ModActionsPluginType>,
  reason: string,
  context: Message | ChatInputCommandInteraction,
  attachments: Attachment[],
) {
  if (isContextMessage(context)) {
    const allAttachments = [...new Set([...context.attachments.values(), ...attachments])];

    if (allAttachments.length === 0) return reason;

    // Append direct CDN URLs so they render as images in the case embed
    const urls = allAttachments.map((a) => a.url).join(" ");
    return ((reason || "") + " " + urls).trim();
  }

  if (attachments.length < 1) {
    return reason;
  }

  const attachmentsMessage = await pluginData.state.common.storeAttachmentsAsMessage(attachments, context.channel);

  return ((reason || "") + " " + attachmentsMessage.url).trim();
}

export function formatReasonWithAttachments(reason: string, attachments: Attachment[]) {
  const attachmentUrls = attachments.map((a) => a.url);
  return ((reason || "") + " " + attachmentUrls.join(" ")).trim();
}