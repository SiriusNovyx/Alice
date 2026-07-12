import { ChannelType, PermissionFlagsBits, VoiceChannel } from "discord.js";
import moment from "moment-timezone";
import { isDiscordAPIError } from "../../../utils.js";
import { voiceMasterEvt } from "../types.js";

export const VoiceStateUpdateEvt = voiceMasterEvt({
  event: "voiceStateUpdate",
  async listener({ pluginData, args: { oldState, newState } }) {
    const config = pluginData.config.get();
    if (!config.enabled || !config.hub_channel_id) {
      return;
    }

    const member = newState.member ?? oldState.member;
    if (!member || member.user.bot) {
      return;
    }

    // Join hub → create temp channel
    if (newState.channelId === config.hub_channel_id && oldState.channelId !== config.hub_channel_id) {
      if (pluginData.state.creating.has(member.id)) {
        return;
      }
      pluginData.state.creating.add(member.id);

      let createdChannelId: string | null = null;
      try {
        const channelName = config.default_name.replaceAll("{user}", member.user.username).slice(0, 100);
        const parentId = config.category_id ?? newState.channel?.parentId ?? undefined;

        const voiceChannel = await pluginData.guild.channels.create({
          name: channelName,
          type: ChannelType.GuildVoice,
          parent: parentId ?? undefined,
          userLimit: config.default_limit || undefined,
          permissionOverwrites: [
            {
              id: member.id,
              allow: [
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.Connect,
                PermissionFlagsBits.MoveMembers,
              ],
            },
          ],
        });
        createdChannelId = voiceChannel.id;

        await member.voice.setChannel(voiceChannel);
        await pluginData.state.voiceChannels.create(
          voiceChannel.id,
          member.id,
          moment.utc().format("YYYY-MM-DD HH:mm:ss"),
        );
      } catch (err) {
        // Soft-fail: hub join without channel creation should not crash the bot
        console.error(`[VoiceMaster] Failed to create channel for ${member.id}:`, err);
        if (createdChannelId) {
          const orphan = pluginData.guild.channels.cache.get(createdChannelId);
          if (orphan) {
            await orphan.delete("VoiceMaster: rollback failed create").catch(() => null);
          }
        }
      } finally {
        pluginData.state.creating.delete(member.id);
      }
    }

    // Leave temp channel → delete if empty
    if (oldState.channelId && oldState.channelId !== newState.channelId) {
      const record = await pluginData.state.voiceChannels.findByChannelId(oldState.channelId);
      if (!record) {
        return;
      }

      const channel = oldState.channel as VoiceChannel | null;
      if (!channel || channel.members.size > 0) {
        return;
      }

      try {
        await channel.delete("VoiceMaster: channel empty");
        await pluginData.state.voiceChannels.delete(oldState.channelId);
      } catch (err) {
        // Unknown Channel — already gone; clear DB. Otherwise keep the row so we can retry.
        if (isDiscordAPIError(err) && err.code === 10003) {
          await pluginData.state.voiceChannels.delete(oldState.channelId);
        } else {
          console.error(`[VoiceMaster] Failed to delete empty channel ${oldState.channelId}:`, err);
        }
      }
    }
  },
});
