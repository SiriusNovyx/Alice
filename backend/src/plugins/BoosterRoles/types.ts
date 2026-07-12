import {
  BasePluginType,
  guildPluginEventListener,
  guildPluginMessageCommand,
  guildPluginSlashCommand,
  guildPluginSlashGroup,
  pluginUtils,
} from "vety";
import { z } from "zod";
import { GuildBoosterRoles } from "../../data/GuildBoosterRoles.js";
import { zSnowflake } from "../../utils.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";

export const zBoosterRolesConfig = z.strictObject({
  enabled: z.boolean().default(false),
  booster_role_id: zSnowflake.nullable().default(null),
  max_name_length: z.number().int().min(1).max(100).default(32),
  can_use: z.boolean().default(true),
  can_manage: z.boolean().default(false),
});

export interface BoosterRolesPluginType extends BasePluginType {
  configSchema: typeof zBoosterRolesConfig;
  state: {
    boosterRoles: GuildBoosterRoles;
    common: pluginUtils.PluginPublicInterface<typeof CommonPlugin>;
  };
}

export const boosterRolesCmd = guildPluginMessageCommand<BoosterRolesPluginType>();
export const boosterRolesSlashGroup = guildPluginSlashGroup<BoosterRolesPluginType>();
export const boosterRolesSlashCmd = guildPluginSlashCommand<BoosterRolesPluginType>();
export const boosterRolesEvt = guildPluginEventListener<BoosterRolesPluginType>();
