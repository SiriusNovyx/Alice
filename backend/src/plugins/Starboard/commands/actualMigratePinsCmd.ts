import { ChatInputCommandInteraction, GuildTextBasedChannel, Message, Snowflake, TextChannel } from "discord.js";
import { GuildPluginData } from "vety";
import { isContextMessage } from "../../../pluginUtils.js";
import { StarboardPluginType } from "../types.js";
import { saveMessageToStarboard } from "../util/saveMessageToStarboard.js";

export async function actualMigratePinsCmd(
  pluginData: GuildPluginData<StarboardPluginType>,
  context: Message | ChatInputCommandInteraction,
  pinChannel: GuildTextBasedChannel,
  starboardName: string,
) {
  const config = pluginData.config.get();
  const starboard = config.boards[starboardName];
  if (!starboard) {
    await pluginData.state.common.sendErrorMessage(context, "Unknown starboard specified");
    return;
  }

  const starboardChannel = pluginData.guild.channels.cache.get(starboard.channel_id as Snowflake);
  if (!starboardChannel || !(starboardChannel instanceof TextChannel)) {
    await pluginData.state.common.sendErrorMessage(context, "Starboard has an unknown/invalid channel id");
    return;
  }

  if (isContextMessage(context) && context.channel.isSendable()) {
    await context.channel.send(`Migrating pins from <#${pinChannel.id}> to <#${starboardChannel.id}>...`);
  }

  const pins = [...(await pinChannel.messages.fetchPinned().catch(() => [])).values()];
  pins.reverse();

  for (const pin of pins) {
    const existingStarboardMessage = await pluginData.state.starboardMessages.getMatchingStarboardMessages(
      starboardChannel.id,
      pin.id,
    );
    if (existingStarboardMessage.length > 0) continue;
    await saveMessageToStarboard(pluginData, pin, starboard);
  }

  await pluginData.state.common.sendSuccessMessage(
    context,
    `Pins migrated from <#${pinChannel.id}> to <#${starboardChannel.id}>!`,
  );
}
