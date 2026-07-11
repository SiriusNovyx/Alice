import { ChatInputCommandInteraction, Message, VoiceChannel } from "discord.js";
import { GuildPluginData } from "vety";
import { canActOn, isContextMessage } from "../../../pluginUtils.js";
import { renderUsername } from "../../../utils.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { UtilityPluginType } from "../types.js";

export async function actualVcdisconnectCmd(
  pluginData: GuildPluginData<UtilityPluginType>,
  context: Message | ChatInputCommandInteraction,
  authorMember: import("discord.js").GuildMember,
  member: import("discord.js").GuildMember,
) {
  if (!canActOn(pluginData, authorMember, member)) {
    await pluginData.state.common.sendErrorMessage(context, "Cannot move: insufficient permissions");
    return;
  }

  if (!member.voice?.channelId) {
    await pluginData.state.common.sendErrorMessage(context, "Member is not in a voice channel");
    return;
  }

  const channel = pluginData.guild.channels.cache.get(member.voice.channelId) as VoiceChannel;

  try {
    await member.voice.disconnect();
  } catch {
    await pluginData.state.common.sendErrorMessage(context, "Failed to disconnect member");
    return;
  }

  const mod = isContextMessage(context) ? context.author : context.user;
  pluginData.getPlugin(LogsPlugin).logVoiceChannelForceDisconnect({
    mod,
    member,
    oldChannel: channel,
  });

  await pluginData.state.common.sendSuccessMessage(
    context,
    `**${renderUsername(member)}** disconnected from **${channel.name}**`,
  );
}
