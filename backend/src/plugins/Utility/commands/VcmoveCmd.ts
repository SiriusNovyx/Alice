import { ChannelType, Snowflake, VoiceChannel } from "discord.js";
import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { resolveMessageMember } from "../../../pluginUtils.js";
import { channelMentionRegex, isSnowflake, simpleClosestStringMatch } from "../../../utils.js";
import { utilityCmd } from "../types.js";
import { actualVcmoveAllCmd, actualVcmoveCmd } from "./actualVcmoveCmd.js";

function resolveVoiceChannel(
  pluginData: { guild: import("discord.js").Guild },
  channelInput: string,
): VoiceChannel | null {
  if (isSnowflake(channelInput)) {
    const potentialChannel = pluginData.guild.channels.cache.get(channelInput as Snowflake);
    if (!potentialChannel || !(potentialChannel instanceof VoiceChannel)) return null;
    return potentialChannel;
  }

  if (channelMentionRegex.test(channelInput)) {
    const channelId = channelInput.match(channelMentionRegex)![1];
    const potentialChannel = pluginData.guild.channels.cache.get(channelId as Snowflake);
    if (!potentialChannel || !(potentialChannel instanceof VoiceChannel)) return null;
    return potentialChannel;
  }

  const voiceChannels = [...pluginData.guild.channels.cache.values()].filter(
    (c): c is VoiceChannel => c.type === ChannelType.GuildVoice,
  );
  return simpleClosestStringMatch(channelInput, voiceChannels, (ch) => ch.name) ?? null;
}

export const VcmoveCmd = utilityCmd({
  trigger: "vcmove",
  description: "Move a member to another voice channel",
  usage: "!vcmove <user> <channel>",
  permission: "can_vcmove",

  signature: {
    member: ct.resolvedMember(),
    channel: ct.string({ catchAll: true }),
  },

  async run({ message: msg, args, pluginData }) {
    const channel = resolveVoiceChannel(pluginData, args.channel);
    if (!channel) {
      void pluginData.state.common.sendErrorMessage(
        msg,
        isSnowflake(args.channel) || channelMentionRegex.test(args.channel)
          ? "Unknown or non-voice channel"
          : "No matching voice channels",
      );
      return;
    }

    await actualVcmoveCmd(pluginData, msg, args.member, channel);
  },
});

export const VcmoveAllCmd = utilityCmd({
  trigger: "vcmoveall",
  description: "Move all members of a voice channel to another voice channel",
  usage: "!vcmoveall <fromChannel> <toChannel>",
  permission: "can_vcmove",

  signature: {
    oldChannel: ct.voiceChannel(),
    channel: ct.string({ catchAll: true }),
  },

  async run({ message: msg, args, pluginData }) {
    const channel = resolveVoiceChannel(pluginData, args.channel);
    if (!channel) {
      void pluginData.state.common.sendErrorMessage(
        msg,
        isSnowflake(args.channel) || channelMentionRegex.test(args.channel)
          ? "Unknown or non-voice channel"
          : "No matching voice channels",
      );
      return;
    }

    const authorMember = await resolveMessageMember(msg);
    await actualVcmoveAllCmd(pluginData, msg, authorMember, args.oldChannel, channel);
  },
});
