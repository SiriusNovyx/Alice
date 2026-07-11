import { ChatInputCommandInteraction, GuildMember, GuildTextBasedChannel, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { getContextChannel, isContextInteraction } from "../../../pluginUtils.js";
import { LocateUserPluginType } from "../types.js";
import { sendWhere } from "../utils/sendWhere.js";

export async function actualWhereCmd(
  pluginData: GuildPluginData<LocateUserPluginType>,
  context: Message | ChatInputCommandInteraction,
  authorId: string,
  member: GuildMember,
) {
  const channel = await getContextChannel(context);
  if (!channel?.isSendable() || channel.isDMBased()) {
    await pluginData.state.common.sendErrorMessage(context, "Cannot send to this channel");
    return;
  }

  await sendWhere(pluginData, member, channel as GuildTextBasedChannel, `<@${authorId}> | `);

  if (isContextInteraction(context)) {
    await pluginData.state.common.sendSuccessMessage(context, "Location posted to the channel");
  }
}
