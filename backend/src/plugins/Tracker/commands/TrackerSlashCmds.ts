import { ChannelType } from "discord.js";
import { slashOptions } from "vety";
import { trackerSlashCmd } from "../types.js";
import {
  actualBlacklistAddCmd,
  actualBlacklistListCmd,
  actualBlacklistRemoveCmd,
  actualInvitesCmd,
  actualMessagesCmd,
  actualOverviewCmd,
} from "./actualTrackerCmds.js";

const textChannelTypes = [
  ChannelType.GuildText,
  ChannelType.GuildAnnouncement,
  ChannelType.PublicThread,
  ChannelType.PrivateThread,
];

export const TrackerOverviewSlashCmd = trackerSlashCmd({
  name: "overview",
  configPermission: "can_manage",
  description: "Show tracker overview for this server",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualOverviewCmd(pluginData, interaction);
  },
});

export const TrackerMessagesSlashCmd = trackerSlashCmd({
  name: "messages",
  configPermission: "can_check",
  description: "Show message counts for a member",
  allowDms: false,
  signature: [slashOptions.user({ name: "user", description: "Member to check", required: false })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    const user = options.user ?? interaction.user;
    const member = await pluginData.guild.members.fetch(user.id).catch(() => null);
    await actualMessagesCmd(pluginData, interaction, user, member);
  },
});

export const TrackerInvitesSlashCmd = trackerSlashCmd({
  name: "invites",
  configPermission: "can_check",
  description: "Show invite stats for a member",
  allowDms: false,
  signature: [slashOptions.user({ name: "user", description: "Member to check", required: false })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualInvitesCmd(pluginData, interaction, options.user ?? interaction.user);
  },
});

export const TrackerBlacklistAddSlashCmd = trackerSlashCmd({
  name: "blacklist",
  configPermission: "can_manage",
  description: "Blacklist a channel from message counting",
  allowDms: false,
  signature: [
    slashOptions.channel({
      name: "channel",
      description: "Channel to blacklist",
      channelTypes: textChannelTypes,
      required: false,
    }),
  ],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    const channelId = options.channel?.id ?? interaction.channelId;
    if (!channelId) return;
    const channel = pluginData.guild.channels.cache.get(channelId);
    if (!channel?.isTextBased() || channel.isDMBased()) return;
    await actualBlacklistAddCmd(pluginData, interaction, channel);
  },
});

export const TrackerBlacklistRemoveSlashCmd = trackerSlashCmd({
  name: "unblacklist",
  configPermission: "can_manage",
  description: "Remove a channel from the message blacklist",
  allowDms: false,
  signature: [
    slashOptions.channel({
      name: "channel",
      description: "Channel to unblacklist",
      channelTypes: textChannelTypes,
      required: false,
    }),
  ],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    const channelId = options.channel?.id ?? interaction.channelId;
    if (!channelId) return;
    const channel = pluginData.guild.channels.cache.get(channelId);
    if (!channel?.isTextBased() || channel.isDMBased()) return;
    await actualBlacklistRemoveCmd(pluginData, interaction, channel);
  },
});

export const TrackerBlacklistListSlashCmd = trackerSlashCmd({
  name: "blacklist-list",
  configPermission: "can_manage",
  description: "List channels blacklisted from message counting",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualBlacklistListCmd(pluginData, interaction);
  },
});
