import { ChatInputCommandInteraction, Message, Snowflake } from "discord.js";
import { GuildPluginData } from "vety";
import { isContextInteraction, sendContextResponse } from "../../../pluginUtils.js";
import { MutesPluginType } from "../types.js";

export async function actualClearBannedMutesCmd(
  pluginData: GuildPluginData<MutesPluginType>,
  context: Message | ChatInputCommandInteraction,
) {
  const status = "Clearing mutes from banned users...";
  if (isContextInteraction(context)) {
    await sendContextResponse(context, status, true);
  } else if (context.channel.isSendable()) {
    await context.channel.send(status);
  }

  const activeMutes = await pluginData.state.mutes.getActiveMutes();

  const bans = await pluginData.guild.bans.fetch({ cache: true });
  const bannedIds = bans.map((b) => b.user.id);

  const progress = `Found ${activeMutes.length} mutes and ${bannedIds.length} bans, cross-referencing...`;
  if (isContextInteraction(context)) {
    await context.followUp({ content: progress, ephemeral: true });
  } else if (context.channel.isSendable()) {
    await context.channel.send(progress);
  }

  let cleared = 0;
  for (const mute of activeMutes) {
    if (bannedIds.includes(mute.user_id as Snowflake)) {
      await pluginData.state.mutes.clear(mute.user_id);
      cleared++;
    }
  }

  await pluginData.state.common.sendSuccessMessage(context, `Cleared ${cleared} mutes from banned users!`);
}
