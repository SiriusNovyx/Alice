import { ChatInputCommandInteraction, Message } from "discord.js";
import { GuildPluginData } from "vety";
import moment from "moment-timezone";
import { createChunkedMessage } from "../../../utils.js";
import { getOrFetchGuildMember } from "../../../utils/getOrFetchGuildMember.js";
import { getOrFetchUser } from "../../../utils/getOrFetchUser.js";
import { getContextChannel, isContextInteraction, sendContextResponse } from "../../../pluginUtils.js";
import { runAutomod } from "../functions/runAutomod.js";
import { AutomodContext, AutomodPluginType } from "../types.js";

export async function actualDebugAutomodCmd(
  pluginData: GuildPluginData<AutomodPluginType>,
  context: Message | ChatInputCommandInteraction,
  messageId: string,
) {
  const targetMessage = await pluginData.state.savedMessages.find(messageId);
  if (!targetMessage || targetMessage.guild_id !== pluginData.guild.id) {
    await pluginData.state.common.sendErrorMessage(context, "Message not found");
    return;
  }

  const member = await getOrFetchGuildMember(pluginData.guild, targetMessage.user_id);
  const user = await getOrFetchUser(pluginData.client, targetMessage.user_id);
  const automodContext: AutomodContext = {
    timestamp: moment.utc(targetMessage.posted_at).valueOf(),
    message: targetMessage,
    user,
    member,
  };

  const result = await runAutomod(pluginData, automodContext, true);

  let resultText = `**${result.triggered ? "✔️ Triggered" : "❌ Not triggered"}**\n\nRules checked:\n\n`;
  for (const ruleResult of result.rulesChecked) {
    resultText += `**${ruleResult.ruleName}**\n`;
    if (ruleResult.outcome.success) {
      resultText += `\\- Matched trigger: ${ruleResult.outcome.matchedTrigger.name} (trigger #${ruleResult.outcome.matchedTrigger.num})\n`;
    } else {
      resultText += `\\- No match (${ruleResult.outcome.reason})\n`;
    }
  }

  const trimmed = resultText.trim();
  if (isContextInteraction(context)) {
    await sendContextResponse(context, trimmed, true);
  } else {
    const channel = await getContextChannel(context);
    if (channel?.isSendable()) {
      await createChunkedMessage(channel, trimmed);
    }
  }
}
