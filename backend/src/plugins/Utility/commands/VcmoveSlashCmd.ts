import { ChannelType, GuildMember, VoiceChannel } from "discord.js";
import { slashOptions } from "vety";
import { utilitySlashCmd } from "../types.js";
import { actualVcmoveAllCmd, actualVcmoveCmd } from "./actualVcmoveCmd.js";
import { actualVcdisconnectCmd } from "./actualVcdisconnectCmd.js";

export const VcmoveSlashCmd = utilitySlashCmd({
  name: "vcmove",
  configPermission: "can_vcmove",
  description: "Move a member to another voice channel",
  allowDms: false,

  signature: [
    slashOptions.user({ name: "member", description: "Member to move", required: true }),
    slashOptions.channel({
      name: "channel",
      description: "Destination voice channel",
      channelTypes: [ChannelType.GuildVoice],
      required: true,
    }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const member = await pluginData.guild.members.fetch(options.member.id).catch(() => null);
    if (!member) {
      await pluginData.state.common.sendErrorMessage(interaction, "Member not found");
      return;
    }

    const channel = pluginData.guild.channels.cache.get(options.channel.id);
    if (!(channel instanceof VoiceChannel)) {
      await pluginData.state.common.sendErrorMessage(interaction, "Unknown or non-voice channel");
      return;
    }

    await actualVcmoveCmd(pluginData, interaction, member, channel);
  },
});

export const VcmoveAllSlashCmd = utilitySlashCmd({
  name: "vcmoveall",
  configPermission: "can_vcmove",
  description: "Move all members from one voice channel to another",
  allowDms: false,

  signature: [
    slashOptions.channel({
      name: "from",
      description: "Source voice channel",
      channelTypes: [ChannelType.GuildVoice],
      required: true,
    }),
    slashOptions.channel({
      name: "to",
      description: "Destination voice channel",
      channelTypes: [ChannelType.GuildVoice],
      required: true,
    }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const oldChannel = pluginData.guild.channels.cache.get(options.from.id);
    const channel = pluginData.guild.channels.cache.get(options.to.id);
    if (!(oldChannel instanceof VoiceChannel) || !(channel instanceof VoiceChannel)) {
      await pluginData.state.common.sendErrorMessage(interaction, "Unknown or non-voice channel");
      return;
    }

    const authorMember =
      (interaction.member as GuildMember) ??
      (await pluginData.guild.members.fetch(interaction.user.id).catch(() => null));
    if (!authorMember) {
      await pluginData.state.common.sendErrorMessage(interaction, "Failed to resolve your member info");
      return;
    }

    await actualVcmoveAllCmd(pluginData, interaction, authorMember, oldChannel, channel);
  },
});

export const VcdisconnectSlashCmd = utilitySlashCmd({
  name: "vcdisconnect",
  configPermission: "can_vckick",
  description: "Disconnect a member from their voice channel",
  allowDms: false,

  signature: [slashOptions.user({ name: "member", description: "Member to disconnect", required: true })],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const member = await pluginData.guild.members.fetch(options.member.id).catch(() => null);
    if (!member) {
      await pluginData.state.common.sendErrorMessage(interaction, "Member not found");
      return;
    }

    const authorMember =
      (interaction.member as GuildMember) ??
      (await pluginData.guild.members.fetch(interaction.user.id).catch(() => null));
    if (!authorMember) {
      await pluginData.state.common.sendErrorMessage(interaction, "Failed to resolve your member info");
      return;
    }

    await actualVcdisconnectCmd(pluginData, interaction, authorMember, member);
  },
});
