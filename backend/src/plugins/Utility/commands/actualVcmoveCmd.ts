import { ChatInputCommandInteraction, Message, VoiceChannel } from "discord.js";
import { GuildPluginData } from "vety";
import { canActOn, isContextMessage } from "../../../pluginUtils.js";
import { renderUsername } from "../../../utils.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { UtilityPluginType } from "../types.js";

export async function actualVcmoveCmd(
  pluginData: GuildPluginData<UtilityPluginType>,
  context: Message | ChatInputCommandInteraction,
  member: import("discord.js").GuildMember,
  channel: VoiceChannel,
) {
  if (!member.voice?.channelId) {
    await pluginData.state.common.sendErrorMessage(context, "Member is not in a voice channel");
    return;
  }

  if (member.voice.channelId === channel.id) {
    await pluginData.state.common.sendErrorMessage(context, "Member is already on that channel!");
    return;
  }

  const oldVoiceChannel = pluginData.guild.channels.cache.get(member.voice.channelId) as VoiceChannel;

  try {
    await member.edit({ channel: channel.id });
  } catch {
    await pluginData.state.common.sendErrorMessage(context, "Failed to move member");
    return;
  }

  const mod = isContextMessage(context) ? context.author : context.user;
  pluginData.getPlugin(LogsPlugin).logVoiceChannelForceMove({
    mod,
    member,
    oldChannel: oldVoiceChannel,
    newChannel: channel,
  });

  await pluginData.state.common.sendSuccessMessage(
    context,
    `**${renderUsername(member)}** moved to **${channel.name}**`,
  );
}

export async function actualVcmoveAllCmd(
  pluginData: GuildPluginData<UtilityPluginType>,
  context: Message | ChatInputCommandInteraction,
  authorMember: import("discord.js").GuildMember,
  oldChannel: VoiceChannel,
  channel: VoiceChannel,
) {
  if (oldChannel.members.size === 0) {
    await pluginData.state.common.sendErrorMessage(context, "Voice channel is empty");
    return;
  }

  if (oldChannel.id === channel.id) {
    await pluginData.state.common.sendErrorMessage(context, "Cant move from and to the same channel!");
    return;
  }

  const mod = isContextMessage(context) ? context.author : context.user;
  let currMember = authorMember;
  const moveAmt = oldChannel.members.size;
  let errAmt = 0;

  for (const memberWithId of oldChannel.members) {
    currMember = memberWithId[1];

    if (currMember.id !== authorMember.id && !canActOn(pluginData, authorMember, currMember)) {
      await pluginData.state.common.sendErrorMessage(
        context,
        `Failed to move ${renderUsername(currMember)} (${currMember.id}): You cannot act on this member`,
      );
      errAmt++;
      continue;
    }

    try {
      await currMember.edit({ channel: channel.id });
    } catch {
      if (authorMember.id === currMember.id) {
        await pluginData.state.common.sendErrorMessage(context, "Unknown error when trying to move members");
        return;
      }
      await pluginData.state.common.sendErrorMessage(
        context,
        `Failed to move ${renderUsername(currMember)} (${currMember.id})`,
      );
      errAmt++;
      continue;
    }

    pluginData.getPlugin(LogsPlugin).logVoiceChannelForceMove({
      mod,
      member: currMember,
      oldChannel,
      newChannel: channel,
    });
  }

  if (moveAmt !== errAmt) {
    await pluginData.state.common.sendSuccessMessage(
      context,
      `${moveAmt - errAmt} members from **${oldChannel.name}** moved to **${channel.name}**`,
    );
  } else {
    await pluginData.state.common.sendErrorMessage(context, `Failed to move any members.`);
  }
}
