import {
  BasePluginType,
  guildPluginMessageCommand,
  guildPluginSlashCommand,
  guildPluginSlashGroup,
  pluginUtils,
} from "vety";
import { z } from "zod";
import { GuildLogs } from "../../data/GuildLogs.js";
import { GuildTempRoles } from "../../data/GuildTempRoles.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";

export const zRolesConfig = z.strictObject({
  can_assign: z.boolean().default(false),
  can_assign_temp: z.boolean().default(false),
  can_mass_assign: z.boolean().default(false),
  assignable_roles: z.array(z.string()).max(100).default([]),
});

export interface RolesPluginType extends BasePluginType {
  configSchema: typeof zRolesConfig;
  state: {
    logs: GuildLogs;
    tempRoles: GuildTempRoles;
    common: pluginUtils.PluginPublicInterface<typeof CommonPlugin>;
    unregisterGuildEventListener?: () => void;
  };
}

export const rolesCmd = guildPluginMessageCommand<RolesPluginType>();
export const rolesSlashGroup = guildPluginSlashGroup<RolesPluginType>();
export const rolesSlashCmd = guildPluginSlashCommand<RolesPluginType>();
