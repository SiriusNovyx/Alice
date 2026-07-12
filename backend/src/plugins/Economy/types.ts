import {
  BasePluginType,
  guildPluginMessageCommand,
  guildPluginSlashCommand,
  guildPluginSlashGroup,
  pluginUtils,
} from "vety";
import { z } from "zod";
import { GuildEconomyClans } from "../../data/GuildEconomyClans.js";
import { GuildEconomyCreatures } from "../../data/GuildEconomyCreatures.js";
import { GuildEconomyInventory } from "../../data/GuildEconomyInventory.js";
import { GuildEconomyMarriages } from "../../data/GuildEconomyMarriages.js";
import { GuildEconomyProfiles } from "../../data/GuildEconomyProfiles.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";

export const zEconomyConfig = z.strictObject({
  enabled: z.boolean().default(false),
  currency_name: z.string().max(32).default("coins"),
  work_min: z.number().int().min(1).default(50),
  work_max: z.number().int().min(1).default(150),
  work_cooldown_seconds: z.number().int().min(0).default(3600),
  crime_min: z.number().int().min(1).default(100),
  crime_max: z.number().int().min(1).default(400),
  crime_fail_chance: z.number().min(0).max(1).default(0.4),
  crime_cooldown_seconds: z.number().int().min(0).default(7200),
  daily_amount: z.number().int().min(1).default(500),
  weekly_amount: z.number().int().min(1).default(2500),
  beg_min: z.number().int().min(0).default(10),
  beg_max: z.number().int().min(0).default(80),
  beg_cooldown_seconds: z.number().int().min(0).default(300),
  rob_cooldown_seconds: z.number().int().min(0).default(3600),
  rob_success_chance: z.number().min(0).max(1).default(0.45),
  rob_max_pct: z.number().min(0.01).max(1).default(0.25),
  hunt_cooldown_seconds: z.number().int().min(0).default(60),
  battle_cooldown_seconds: z.number().int().min(0).default(120),
  battle_win_min: z.number().int().min(0).default(100),
  battle_win_max: z.number().int().min(0).default(400),
  slots_cooldown_seconds: z.number().int().min(0).default(15),
  gamble_min: z.number().int().min(1).default(10),
  gamble_max_pct: z.number().min(0.01).max(1).default(0.5),
  can_use: z.boolean().default(true),
  can_manage: z.boolean().default(false),
});

export interface EconomyPluginType extends BasePluginType {
  configSchema: typeof zEconomyConfig;
  state: {
    profiles: GuildEconomyProfiles;
    inventory: GuildEconomyInventory;
    creatures: GuildEconomyCreatures;
    clans: GuildEconomyClans;
    marriages: GuildEconomyMarriages;
    common: pluginUtils.PluginPublicInterface<typeof CommonPlugin>;
  };
}

export const economyCmd = guildPluginMessageCommand<EconomyPluginType>();
export const economySlashGroup = guildPluginSlashGroup<EconomyPluginType>();
export const economySlashCmd = guildPluginSlashCommand<EconomyPluginType>();
