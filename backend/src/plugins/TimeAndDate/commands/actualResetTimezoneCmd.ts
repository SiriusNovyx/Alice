import { ChatInputCommandInteraction, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { getGuildTz } from "../functions/getGuildTz.js";
import { TimeAndDatePluginType } from "../types.js";

export async function actualResetTimezoneCmd(
  pluginData: GuildPluginData<TimeAndDatePluginType>,
  context: Message | ChatInputCommandInteraction,
  userId: string,
) {
  await pluginData.state.memberTimezones.reset(userId);
  const serverTimezone = getGuildTz(pluginData);
  await pluginData.state.common.sendSuccessMessage(
    context,
    `Your timezone has been reset to server default, **${serverTimezone}**`,
  );
}
