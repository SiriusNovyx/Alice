import {
  BasePluginType,
  guildPluginEventListener,
  guildPluginMessageCommand,
  guildPluginSlashCommand,
  guildPluginSlashGroup,
  pluginUtils,
} from "vety";
import { z } from "zod";
import { GuildTrackerBlacklistedChannels } from "../../data/GuildTrackerBlacklistedChannels.js";
import { GuildTrackerInvites } from "../../data/GuildTrackerInvites.js";
import { GuildTrackerMessages } from "../../data/GuildTrackerMessages.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";

export const zTrackerConfig = z.strictObject({
  enabled: z.boolean().default(true),
  can_check: z.boolean().default(true),
  can_manage: z.boolean().default(false),
});

export interface TrackerPluginType extends BasePluginType {
  configSchema: typeof zTrackerConfig;
  state: {
    messages: GuildTrackerMessages;
    invites: GuildTrackerInvites;
    blacklist: GuildTrackerBlacklistedChannels;
    /** In-memory invite uses by code for join attribution */
    inviteUses: Map<string, number>;
    common: pluginUtils.PluginPublicInterface<typeof CommonPlugin>;
  };
}

export const trackerCmd = guildPluginMessageCommand<TrackerPluginType>();
export const trackerSlashGroup = guildPluginSlashGroup<TrackerPluginType>();
export const trackerSlashCmd = guildPluginSlashCommand<TrackerPluginType>();
export const trackerEvt = guildPluginEventListener<TrackerPluginType>();
