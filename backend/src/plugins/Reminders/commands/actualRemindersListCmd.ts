import { ChatInputCommandInteraction, Message } from "discord.js";
import { GuildPluginData } from "vety";
import moment from "moment-timezone";
import { humanizeDuration } from "../../../humanizeDuration.js";
import { createChunkedMessage, DBDateFormat, sorter } from "../../../utils.js";
import { getContextChannel, isContextInteraction, sendContextResponse } from "../../../pluginUtils.js";
import { TimeAndDatePlugin } from "../../TimeAndDate/TimeAndDatePlugin.js";
import { RemindersPluginType } from "../types.js";

export async function actualRemindersListCmd(
  pluginData: GuildPluginData<RemindersPluginType>,
  context: Message | ChatInputCommandInteraction,
  userId: string,
) {
  const reminders = await pluginData.state.reminders.getRemindersByUserId(userId);
  if (reminders.length === 0) {
    await pluginData.state.common.sendErrorMessage(context, "No reminders");
    return;
  }

  const timeAndDate = pluginData.getPlugin(TimeAndDatePlugin);

  reminders.sort(sorter("remind_at"));
  const longestNum = (reminders.length + 1).toString().length;
  const lines = Array.from(reminders.entries()).map(([i, reminder]) => {
    const num = i + 1;
    const paddedNum = num.toString().padStart(longestNum, " ");
    const target = moment.utc(reminder.remind_at, "YYYY-MM-DD HH:mm:ss");
    const diff = target.diff(moment.utc());
    const result = humanizeDuration(diff, { largest: 2, round: true });
    const prettyRemindAt = timeAndDate
      .inGuildTz(moment.utc(reminder.remind_at, DBDateFormat))
      .format(timeAndDate.getDateFormat("pretty_datetime"));
    return `\`${paddedNum}.\` \`${prettyRemindAt} (${result})\` ${reminder.body}`;
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
