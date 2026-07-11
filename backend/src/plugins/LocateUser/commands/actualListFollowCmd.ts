import { ChatInputCommandInteraction, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { createChunkedMessage, sorter } from "../../../utils.js";
import { getContextChannel, isContextInteraction, sendContextResponse } from "../../../pluginUtils.js";
import { LocateUserPluginType } from "../types.js";

export async function actualListFollowCmd(
  pluginData: GuildPluginData<LocateUserPluginType>,
  context: Message | ChatInputCommandInteraction,
  userId: string,
) {
  const alerts = await pluginData.state.alerts.getAlertsByRequestorId(userId);
  if (alerts.length === 0) {
    await pluginData.state.common.sendErrorMessage(context, "You have no active alerts!");
    return;
  }

  alerts.sort(sorter("expires_at"));
  const longestNum = (alerts.length + 1).toString().length;
  const lines = Array.from(alerts.entries()).map(([i, alert]) => {
    const num = i + 1;
    const paddedNum = num.toString().padStart(longestNum, " ");
    return `\`${paddedNum}.\` \`${alert.expires_at}\` **Target:** <@!${alert.user_id}> **Reminder:** \`${
      alert.body
    }\` **Active:** ${alert.active.valueOf()}`;
  });

  const text = lines.join("\n");
  if (isContextInteraction(context)) {
    await sendContextResponse(context, text, true);
  } else {
    const channel = await getContextChannel(context);
    if (channel?.isSendable()) {
      await createChunkedMessage(channel, text);
    }
  }
}
