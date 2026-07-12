import {
  BasePluginType,
  guildPluginEventListener,
  guildPluginMessageCommand,
  guildPluginSlashCommand,
  guildPluginSlashGroup,
  pluginUtils,
} from "vety";
import { z } from "zod";
import { GuildArchives } from "../../data/GuildArchives.js";
import { GuildTicketPanels } from "../../data/GuildTicketPanels.js";
import { GuildTickets } from "../../data/GuildTickets.js";
import { zBoundedCharacters, zBoundedRecord, zSnowflake } from "../../utils.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";

export const zTicketCategory = z.strictObject({
  name: z.string().max(100),
  description: z.string().max(100).default("Open a ticket"),
  emoji: z.string().max(32).nullable().default(null),
  category_id: zSnowflake.nullable().default(null),
  staff_role_ids: z.array(zSnowflake).default([]),
});

export type TTicketCategory = z.infer<typeof zTicketCategory>;

export const zTicketsConfig = z.strictObject({
  enabled: z.boolean().default(false),
  support_role_ids: z.array(zSnowflake).default([]),
  log_channel_id: zSnowflake.nullable().default(null),
  parent_category_id: zSnowflake.nullable().default(null),
  categories: zBoundedRecord(z.record(zBoundedCharacters(1, 64), zTicketCategory), 0, 25).default({}),
  panel_title: z.string().max(256).default("Tickets"),
  panel_description: z.string().max(4000).default("Select a category below to open a ticket."),
  channel_name: z.string().max(100).default("ticket-{user}"),
  max_open_per_user: z.number().int().min(1).max(10).default(1),
  can_manage: z.boolean().default(false),
  can_use: z.boolean().default(true),
});

export interface TicketsPluginType extends BasePluginType {
  configSchema: typeof zTicketsConfig;
  state: {
    tickets: GuildTickets;
    panels: GuildTicketPanels;
    archives: GuildArchives;
    common: pluginUtils.PluginPublicInterface<typeof CommonPlugin>;
    opening: Set<string>;
  };
}

export const ticketsCmd = guildPluginMessageCommand<TicketsPluginType>();
export const ticketsSlashGroup = guildPluginSlashGroup<TicketsPluginType>();
export const ticketsSlashCmd = guildPluginSlashCommand<TicketsPluginType>();
export const ticketsEvt = guildPluginEventListener<TicketsPluginType>();
