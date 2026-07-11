import { ChatInputCommandInteraction, Message, Snowflake } from "discord.js";
import { GuildPluginData } from "vety";
import { resolveMember } from "../../../utils.js";
import { isContextInteraction, sendContextResponse } from "../../../pluginUtils.js";
import { MutesPluginType } from "../types.js";

export async function actualClearMutesWithoutRoleCmd(
  pluginData: GuildPluginData<MutesPluginType>,
  context: Message | ChatInputCommandInteraction,
) {
  const activeMutes = await pluginData.state.mutes.getActiveMutes();
  const muteRole = pluginData.config.get().mute_role;
  if (!muteRole) {
    await pluginData.state.common.sendErrorMessage(context, "No mute role configured");
    return;
  }

  const status = "Clearing mutes from members that don't have the mute role...";
  if (isContextInteraction(context)) {
    await sendContextResponse(context, status, true);
  } else if (context.channel.isSendable()) {
    await context.channel.send(status);
  }

  let cleared = 0;
  for (const mute of activeMutes) {
    const member = await resolveMember(pluginData.client, pluginData.guild, mute.user_id);
    if (!member) continue;

    if (!member.roles.cache.has(muteRole as Snowflake)) {
      await pluginData.state.mutes.clear(mute.user_id);
      cleared++;
    }
  }

  await pluginData.state.common.sendSuccessMessage(
    context,
    `Cleared ${cleared} mutes from members that don't have the mute role`,
  );
}
