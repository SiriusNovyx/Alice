import {
  BasePluginType,
  guildPluginEventListener,
  guildPluginMessageCommand,
  guildPluginSlashCommand,
  guildPluginSlashGroup,
  pluginUtils,
} from "vety";
import { z } from "zod";
import { zSnowflake } from "../../utils.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";

/**
 * AntiNuke watches audit-log *mass-action* rates (channels/roles/bans/kicks).
 * It does NOT inspect messages — leave spam/content to Automod.
 */
export const zAntiNukeConfig = z.strictObject({
  enabled: z.boolean().default(false),
  quarantine_role_id: zSnowflake.nullable().default(null),
  log_channel_id: zSnowflake.nullable().default(null),
  whitelist_user_ids: z.array(zSnowflake).default([]),
  whitelist_role_ids: z.array(zSnowflake).default([]),
  /** Roles to ping when panic activates */
  panic_ping_role_ids: z.array(zSnowflake).default([]),
  channel_limit: z.number().int().min(1).max(50).default(3),
  role_limit: z.number().int().min(1).max(50).default(3),
  ban_limit: z.number().int().min(1).max(50).default(3),
  kick_limit: z.number().int().min(1).max(50).default(5),
  window_seconds: z.number().int().min(5).max(300).default(15),
  /** Start session with panic already on (rare; prefer command toggle) */
  panic_mode: z.boolean().default(false),
  /** When a rate limit trips, also run panic (strip dangerous perms + lock sends) */
  auto_panic_on_violation: z.boolean().default(false),
  can_manage: z.boolean().default(false),
});

export interface AntiNukePluginType extends BasePluginType {
  configSchema: typeof zAntiNukeConfig;
  state: {
    common: pluginUtils.PluginPublicInterface<typeof CommonPlugin>;
    /** `${userId}:${action}` -> timestamps */
    actionLog: Map<string, number[]>;
    panic: boolean;
    /** roleId -> previous permission bitfield (string) for restore after panic */
    panicRolePerms: Map<string, string>;
    /** channelIds we locked (SendMessages deny on @everyone) */
    panicLockedChannels: Set<string>;
  };
}

export const antiNukeCmd = guildPluginMessageCommand<AntiNukePluginType>();
export const antiNukeSlashGroup = guildPluginSlashGroup<AntiNukePluginType>();
export const antiNukeSlashCmd = guildPluginSlashCommand<AntiNukePluginType>();
export const antiNukeEvt = guildPluginEventListener<AntiNukePluginType>();
