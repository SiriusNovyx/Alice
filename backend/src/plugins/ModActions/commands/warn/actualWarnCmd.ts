import { Attachment, ChatInputCommandInteraction, GuildMember, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { CaseTypes } from "../../../../data/CaseTypes.js";
import { canActOn } from "../../../../pluginUtils.js";
import { UserNotificationMethod, renderUsername } from "../../../../utils.js";
import { waitForButtonConfirm } from "../../../../utils/waitForInteraction.js";
import { CasesPlugin } from "../../../Cases/CasesPlugin.js";
import { handleAttachmentLinkDetectionAndGetRestriction } from "../../functions/attachmentLinkReaction.js";
import {
  formatReasonWithAttachments,
  formatReasonWithMessageLinkForAttachments,
} from "../../functions/formatReasonForAttachments.js";
import { warnMember } from "../../functions/warnMember.js";
import { ModActionsPluginType } from "../../types.js";

export async function actualWarnCmd(
  pluginData: GuildPluginData<ModActionsPluginType>,
  context: Message | ChatInputCommandInteraction,
  author: GuildMember,
  mod: GuildMember,
  memberToWarn: GuildMember,
  reason: string,
  attachments: Attachment[],
  contactMethods?: UserNotificationMethod[],
) {
  if (await handleAttachmentLinkDetectionAndGetRestriction(pluginData, context, reason)) {
    return;
  }

  if (!canActOn(pluginData, author, memberToWarn)) {
    await pluginData.state.common.sendErrorMessage(context, "Cannot warn: insufficient permissions");
    return;
  }

  const config = pluginData.config.get();
  const formattedReason = await formatReasonWithMessageLinkForAttachments(pluginData, reason, context, attachments);
  const formattedReasonWithAttachments = formatReasonWithAttachments(reason, attachments);

  const casesPlugin = pluginData.getPlugin(CasesPlugin);
  const priorWarnAmount = await casesPlugin.getCaseTypeAmountForUserId(memberToWarn.id, CaseTypes.Warn);
  if (config.warn_notify_enabled && priorWarnAmount >= config.warn_notify_threshold) {
    const reply = await waitForButtonConfirm(
      context,
      { content: config.warn_notify_message.replace("{priorWarnings}", `${priorWarnAmount}`) },
      { confirmText: "Yes", cancelText: "No", restrictToId: author.id },
    );
    if (!reply) {
      await pluginData.state.common.sendErrorMessage(context, "Warn cancelled by moderator");
      return;
    }
  }

  const warnResult = await warnMember(pluginData, memberToWarn, formattedReason, formattedReasonWithAttachments, {
    contactMethods,
    caseArgs: {
      modId: mod.id,
      ppId: mod.id !== author.id ? author.id : undefined,
      reason: formattedReason,
    },
    retryPromptContext: context,
  });

  if (warnResult.status === "failed") {
    const failReason = warnResult.error ? `: ${warnResult.error}` : "";

    await pluginData.state.common.sendErrorMessage(context, `Failed to warn user${failReason}`);

    return;
  }

  const messageResultText = warnResult.notifyResult.text ? ` (${warnResult.notifyResult.text})` : "";

  await pluginData.state.common.sendSuccessMessage(
    context,
    `Warned **${renderUsername(memberToWarn.user)}** (Case #${warnResult.case.case_number})${messageResultText}`,
  );
}
