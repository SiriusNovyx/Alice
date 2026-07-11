import { ChatInputCommandInteraction, Message, TextChannel } from "discord.js";
import { GuildPluginData } from "vety";
import { isContextInteraction, sendContextResponse } from "../../../pluginUtils.js";
import { activeReloads } from "../guildReloads.js";
import { UtilityPluginType } from "../types.js";

export async function actualReloadGuildCmd(
  pluginData: GuildPluginData<UtilityPluginType>,
  context: Message | ChatInputCommandInteraction,
) {
  if (activeReloads.has(pluginData.guild.id)) {
    await pluginData.state.common.sendErrorMessage(context, "A reload is already in progress");
    return;
  }

  const channel = context.channel;
  if (!(channel instanceof TextChannel)) {
    await pluginData.state.common.sendErrorMessage(context, "Cannot reload from this channel");
    return;
  }

  activeReloads.set(pluginData.guild.id, channel);

  if (isContextInteraction(context)) {
    await sendContextResponse(context, "Reloading...", true);
  } else {
    await channel.send("Reloading...");
  }

  pluginData.getVetyInstance().reloadGuild(pluginData.guild.id);
}
