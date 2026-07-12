import { ChannelType, GuildMember, VoiceChannel } from "discord.js";
import { GuildPluginData } from "vety";
import { GenericCommandSource } from "../../../pluginUtils.js";
import { VoiceMasterChannel } from "../../../data/entities/VoiceMasterChannel.js";
import { VoiceMasterPluginType } from "../types.js";

export async function getOwnedVoiceChannel(
  pluginData: GuildPluginData<VoiceMasterPluginType>,
  member: GuildMember,
): Promise<{ channel: VoiceChannel; record: VoiceMasterChannel } | null> {
  const voiceChannel = member.voice.channel;
  if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
    return null;
  }

  const record = await pluginData.state.voiceChannels.findByChannelId(voiceChannel.id);
  if (!record || record.owner_id !== member.id) {
    return null;
  }

  return { channel: voiceChannel as VoiceChannel, record };
}

export async function requireOwnedVoiceChannel(
  pluginData: GuildPluginData<VoiceMasterPluginType>,
  context: GenericCommandSource,
  member: GuildMember,
): Promise<{ channel: VoiceChannel; record: VoiceMasterChannel } | null> {
  const owned = await getOwnedVoiceChannel(pluginData, member);
  if (!owned) {
    await pluginData.state.common.sendErrorMessage(
      context,
      "You must be in a temporary voice channel that you own.",
    );
    return null;
  }
  return owned;
}
