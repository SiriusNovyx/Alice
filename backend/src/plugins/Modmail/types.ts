import {
  BasePluginType,
  guildPluginMessageCommand,
  guildPluginSlashCommand,
  guildPluginSlashGroup,
  pluginUtils,
} from "vety";
import { z } from "zod";
import { GuildArchives } from "../../data/GuildArchives.js";
import { GuildModmailBlacklist } from "../../data/GuildModmailBlacklist.js";
import { GuildModmailThreads } from "../../data/GuildModmailThreads.js";
import { zBoundedCharacters, zBoundedRecord, zSnowflake } from "../../utils.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";

export const zModmailConfig = z.strictObject({
  enabled: z.boolean().default(false),
  category_id: zSnowflake.nullable().default(null),
  staff_role_ids: z.array(zSnowflake).default([]),
  log_channel_id: zSnowflake.nullable().default(null),
  greeting: z.string().max(2000).default("Your message has been forwarded to the staff team."),
  /** Named quick-replies for staff (`!mmsnippet use <name>`). Edit via YAML. */
  snippets: zBoundedRecord(z.record(zBoundedCharacters(1, 50), z.string().max(2000)), 0, 50).default({}),
  can_reply: z.boolean().default(false),
  can_close: z.boolean().default(false),
  can_manage: z.boolean().default(false),
});

export interface ModmailPluginType extends BasePluginType {
  configSchema: typeof zModmailConfig;
  state: {
    threads: GuildModmailThreads;
    blacklist: GuildModmailBlacklist;
    archives: GuildArchives;
    common: pluginUtils.PluginPublicInterface<typeof CommonPlugin>;
  };
}

export const modmailCmd = guildPluginMessageCommand<ModmailPluginType>();
export const modmailSlashGroup = guildPluginSlashGroup<ModmailPluginType>();
export const modmailSlashCmd = guildPluginSlashCommand<ModmailPluginType>();
