import { ChatInputCommandInteraction, GuildTextBasedChannel, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { isContextMessage } from "../../../pluginUtils.js";
import { saveMessagesToDB } from "../saveMessagesToDB.js";
import { MessageSaverPluginType } from "../types.js";

export async function actualSaveMessagesToDBCmd(
  pluginData: GuildPluginData<MessageSaverPluginType>,
  context: Message | ChatInputCommandInteraction,
  channel: GuildTextBasedChannel,
  ids: string[],
) {
  if (isContextMessage(context) && context.channel.isSendable()) {
    await context.channel.send("Saving specified messages...");
  }

  const { savedCount, failed } = await saveMessagesToDB(pluginData, channel, ids);

  if (failed.length) {
    await pluginData.state.common.sendSuccessMessage(
      context,
      `Saved ${savedCount} messages. The following messages could not be saved: ${failed.join(", ")}`,
    );
  } else {
    await pluginData.state.common.sendSuccessMessage(context, `Saved ${savedCount} messages!`);
  }
}
