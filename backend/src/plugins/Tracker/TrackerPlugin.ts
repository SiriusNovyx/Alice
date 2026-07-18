import { guildPlugin } from "vety";
import { GuildTrackerBlacklistedChannels } from "../../data/GuildTrackerBlacklistedChannels.js";
import { GuildTrackerInvites } from "../../data/GuildTrackerInvites.js";
import { GuildTrackerMessages } from "../../data/GuildTrackerMessages.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import {
  TrackerBlacklistAddCmd,
  TrackerBlacklistListCmd,
  TrackerBlacklistRemoveCmd,
  TrackerInvitesCmd,
  TrackerMessagesCmd,
  TrackerOverviewCmd,
} from "./commands/TrackerCmds.js";
import {
  TrackerBlacklistAddSlashCmd,
  TrackerBlacklistListSlashCmd,
  TrackerBlacklistRemoveSlashCmd,
  TrackerInvitesSlashCmd,
  TrackerMessagesSlashCmd,
  TrackerOverviewSlashCmd,
} from "./commands/TrackerSlashCmds.js";
import { InviteCreateEvt } from "./events/InviteCreateEvt.js";
import { InviteDeleteEvt } from "./events/InviteDeleteEvt.js";
import { MemberJoinEvt } from "./events/MemberJoinEvt.js";
import { MemberLeaveEvt } from "./events/MemberLeaveEvt.js";
import { MessageCreateEvt } from "./events/MessageCreateEvt.js";
import { refreshInviteCache } from "./functions/inviteCache.js";
import { TrackerPluginType, trackerSlashGroup, zTrackerConfig } from "./types.js";

export const TrackerPlugin = guildPlugin<TrackerPluginType>()({
  name: "tracker",

  configSchema: zTrackerConfig,
  defaultOverrides: [
    {
      level: ">=50",
      config: {
        // Admins / Manage Guild–tier roles (level ≥50) get admin tracker cmds
        can_manage: true,
      },
    },
  ],

  // prettier-ignore
  messageCommands: [
    TrackerOverviewCmd,
    TrackerMessagesCmd,
    TrackerInvitesCmd,
    TrackerBlacklistAddCmd,
    TrackerBlacklistRemoveCmd,
    TrackerBlacklistListCmd,
  ],

  slashCommands: [
    trackerSlashGroup({
      name: "tracker",
      description: "Message and invite tracking",
      subcommands: [
        TrackerOverviewSlashCmd,
        TrackerMessagesSlashCmd,
        TrackerInvitesSlashCmd,
        TrackerBlacklistAddSlashCmd,
        TrackerBlacklistRemoveSlashCmd,
        TrackerBlacklistListSlashCmd,
      ],
    }),
  ],

  events: [MessageCreateEvt, MemberJoinEvt, MemberLeaveEvt, InviteCreateEvt, InviteDeleteEvt],

  async beforeLoad(pluginData) {
    pluginData.state.messages = GuildTrackerMessages.getGuildInstance(pluginData.guild.id);
    pluginData.state.invites = GuildTrackerInvites.getGuildInstance(pluginData.guild.id);
    pluginData.state.blacklist = GuildTrackerBlacklistedChannels.getGuildInstance(pluginData.guild.id);
    pluginData.state.inviteUses = new Map();

    // Warm from DB so joins work before Discord fetch finishes
    const cached = await pluginData.state.invites.listCache();
    for (const row of cached) {
      pluginData.state.inviteUses.set(row.code, row.uses);
    }
  },

  beforeStart(pluginData) {
    pluginData.state.common = pluginData.getPlugin(CommonPlugin);
  },

  afterLoad(pluginData) {
    void refreshInviteCache(pluginData);
  },
});
