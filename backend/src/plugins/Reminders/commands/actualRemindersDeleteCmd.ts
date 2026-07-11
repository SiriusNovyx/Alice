import { ChatInputCommandInteraction, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { clearUpcomingReminder } from "../../../data/loops/upcomingRemindersLoop.js";
import { sorter } from "../../../utils.js";
import { RemindersPluginType } from "../types.js";

export async function actualRemindersDeleteCmd(
  pluginData: GuildPluginData<RemindersPluginType>,
  context: Message | ChatInputCommandInteraction,
  userId: string,
  num: number,
) {
  const reminders = await pluginData.state.reminders.getRemindersByUserId(userId);
  reminders.sort(sorter("remind_at"));

  if (num > reminders.length || num <= 0) {
    await pluginData.state.common.sendErrorMessage(context, "Unknown reminder");
    return;
  }

  const toDelete = reminders[num - 1];
  clearUpcomingReminder(toDelete);
  await pluginData.state.reminders.delete(toDelete.id);

  await pluginData.state.common.sendSuccessMessage(context, "Reminder deleted");
}
