import { ChatInputCommandInteraction, Message } from "discord.js";
import { GuildPluginData } from "vety";
import moment from "moment-timezone";
import { registerUpcomingReminder } from "../../../data/loops/upcomingRemindersLoop.js";
import { humanizeDuration } from "../../../humanizeDuration.js";
import { convertDelayStringToMS, messageLink } from "../../../utils.js";
import { TimeAndDatePlugin } from "../../TimeAndDate/TimeAndDatePlugin.js";
import { RemindersPluginType } from "../types.js";

export async function actualRemindCmd(
  pluginData: GuildPluginData<RemindersPluginType>,
  context: Message | ChatInputCommandInteraction,
  userId: string,
  channelId: string,
  time: string,
  reminder: string | null | undefined,
  fallbackBody: string,
) {
  const timeAndDate = pluginData.getPlugin(TimeAndDatePlugin);

  const now = moment.utc();
  const tz = await timeAndDate.getMemberTz(userId);

  let reminderTime: moment.Moment;
  if (time.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
    reminderTime = moment.tz(time, "YYYY-M-D", tz).set({
      hour: now.hour(),
      minute: now.minute(),
      second: now.second(),
    });
  } else if (time.match(/^\d{4}-\d{1,2}-\d{1,2}T\d{2}:\d{2}$/)) {
    reminderTime = moment.tz(time, "YYYY-M-D[T]HH:mm", tz).second(0);
  } else {
    const ms = convertDelayStringToMS(time);
    if (ms === null) {
      await pluginData.state.common.sendErrorMessage(context, "Invalid reminder time");
      return;
    }

    reminderTime = moment.utc().add(ms, "millisecond");
  }

  if (!reminderTime.isValid() || reminderTime.isBefore(now)) {
    await pluginData.state.common.sendErrorMessage(context, "Invalid reminder time");
    return;
  }

  const reminderBody = reminder || fallbackBody;
  const created = await pluginData.state.reminders.add(
    userId,
    channelId,
    reminderTime.clone().tz("Etc/UTC").format("YYYY-MM-DD HH:mm:ss"),
    reminderBody,
    moment.utc().format("YYYY-MM-DD HH:mm:ss"),
  );

  registerUpcomingReminder(created);

  const msUntilReminder = reminderTime.diff(now);
  const timeUntilReminder = humanizeDuration(msUntilReminder, { largest: 2, round: true });
  const prettyReminderTime = (await timeAndDate.inMemberTz(userId, reminderTime)).format(
    pluginData.getPlugin(TimeAndDatePlugin).getDateFormat("pretty_datetime"),
  );

  await pluginData.state.common.sendSuccessMessage(
    context,
    `I will remind you in **${timeUntilReminder}** at **${prettyReminderTime}**`,
  );
}
