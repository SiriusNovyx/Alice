import { ChatInputCommandInteraction, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { MutesPluginType } from "../types.js";

export async function actualClearMutesCmd(
  pluginData: GuildPluginData<MutesPluginType>,
  context: Message | ChatInputCommandInteraction,
  userIds: string[],
) {
  const failed: string[] = [];
  for (const id of userIds) {
    const mute = await pluginData.state.mutes.findExistingMuteForUserId(id);
    if (!mute) {
      failed.push(id);
      continue;
    }
    await pluginData.state.mutes.clear(id);
  }

  if (failed.length !== userIds.length) {
    await pluginData.state.common.sendSuccessMessage(
      context,
      `**${userIds.length - failed.length} active mute(s) cleared**`,
    );
  }

  if (failed.length) {
    await pluginData.state.common.sendErrorMessage(
      context,
      `**${failed.length}/${userIds.length} IDs failed**, they are not muted: ${failed.join(" ")}`,
    );
  }
}
