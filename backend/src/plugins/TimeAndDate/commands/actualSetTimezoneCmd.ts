import { ChatInputCommandInteraction, Message, escapeInlineCode } from "discord.js";
import { GuildPluginData } from "vety";
import { trimLines } from "../../../utils.js";
import { parseFuzzyTimezone } from "../../../utils/parseFuzzyTimezone.js";
import { TimeAndDatePluginType } from "../types.js";

export async function actualSetTimezoneCmd(
  pluginData: GuildPluginData<TimeAndDatePluginType>,
  context: Message | ChatInputCommandInteraction,
  userId: string,
  timezone: string,
) {
  const parsedTz = parseFuzzyTimezone(timezone);
  if (!parsedTz) {
    await pluginData.state.common.sendErrorMessage(
      context,
      trimLines(`
        Invalid timezone: \`${escapeInlineCode(timezone)}\`
        Alice uses timezone locations rather than specific timezone names.
        See the **TZ database name** column at <https://en.wikipedia.org/wiki/List_of_tz_database_time_zones> for a list of valid options.
      `),
    );
    return;
  }

  await pluginData.state.memberTimezones.set(userId, parsedTz);
  await pluginData.state.common.sendSuccessMessage(context, `Your timezone is now set to **${parsedTz}**`);
}
