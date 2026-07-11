import { ChatInputCommandInteraction, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { getGuildTz } from "../functions/getGuildTz.js";
import { TimeAndDatePluginType } from "../types.js";

export async function actualViewTimezoneCmd(
  pluginData: GuildPluginData<TimeAndDatePluginType>,
  context: Message | ChatInputCommandInteraction,
  userId: string,
) {
  const memberTimezone = await pluginData.state.memberTimezones.get(userId);
  if (memberTimezone) {
    await pluginData.state.common.sendSuccessMessage(
      context,
      `Your timezone is currently set to **${memberTimezone.timezone}**`,
    );
    return;
  }

  const serverTimezone = getGuildTz(pluginData);
  await pluginData.state.common.sendSuccessMessage(
    context,
    `Your timezone is currently set to **${serverTimezone}** (server default)`,
  );
}
