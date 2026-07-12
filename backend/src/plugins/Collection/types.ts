import {
  BasePluginType,
  guildPluginEventListener,
  guildPluginMessageCommand,
  guildPluginSlashCommand,
  guildPluginSlashGroup,
  pluginUtils,
} from "vety";
import { z } from "zod";
import { GuildCollectionInventory } from "../../data/GuildCollectionInventory.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";

export const zCollectionConfig = z.strictObject({
  enabled: z.boolean().default(false),
  can_use: z.boolean().default(true),
  rolls_per_reset: z.number().int().min(1).max(100).default(10),
  reset_hours: z.number().int().min(1).max(168).default(24),
  pool: z
    .array(
      z.strictObject({
        key: z.string().max(64),
        weight: z.number().int().min(1).default(1),
        rarity: z.enum(["common", "uncommon", "rare", "epic", "legendary"]).default("common"),
      }),
    )
    .default([
      { key: "common_orb", weight: 50, rarity: "common" },
      { key: "rare_gem", weight: 25, rarity: "rare" },
      { key: "epic_relic", weight: 15, rarity: "epic" },
      { key: "legendary_crown", weight: 5, rarity: "legendary" },
    ]),
});

export type PendingCollectionTrade = {
  fromId: string;
  toId: string;
  itemA: string;
  itemB: string;
  expiresAt: number;
};

export interface CollectionPluginType extends BasePluginType {
  configSchema: typeof zCollectionConfig;
  state: {
    inventory: GuildCollectionInventory;
    common: pluginUtils.PluginPublicInterface<typeof CommonPlugin>;
    /** userId -> { used, resetAt ms } */
    rolls: Map<string, { used: number; resetAt: number }>;
    /** offerId -> pending trade awaiting partner accept */
    pendingTrades: Map<string, PendingCollectionTrade>;
  };
}

export const collectionCmd = guildPluginMessageCommand<CollectionPluginType>();
export const collectionSlashGroup = guildPluginSlashGroup<CollectionPluginType>();
export const collectionSlashCmd = guildPluginSlashCommand<CollectionPluginType>();
export const collectionEvt = guildPluginEventListener<CollectionPluginType>();
