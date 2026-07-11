import { guildPlugin } from "vety";
import { onGuildEvent } from "../../data/GuildEvents.js";
import { GuildLogs } from "../../data/GuildLogs.js";
import { GuildTempRoles } from "../../data/GuildTempRoles.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import { LogsPlugin } from "../Logs/LogsPlugin.js";
import { RoleManagerPlugin } from "../RoleManager/RoleManagerPlugin.js";
import { AddRoleCmd } from "./commands/AddRoleCmd.js";
import { AddRoleSlashCmd } from "./commands/AddRoleSlashCmd.js";
import { AddTempRoleCmd } from "./commands/AddTempRoleCmd.js";
import { AddTempRoleSlashCmd } from "./commands/AddTempRoleSlashCmd.js";
import { RemoveRoleSlashCmd } from "./commands/RemoveRoleSlashCmd.js";
import { MassAddRoleCmd } from "./commands/MassAddRoleCmd.js";
import { MassRemoveRoleCmd } from "./commands/MassRemoveRoleCmd.js";
import { RemoveRoleCmd } from "./commands/RemoveRoleCmd.js";
import { RemoveTempRoleCmd } from "./commands/RemoveTempRoleCmd.js";
import { RemoveTempRoleSlashCmd } from "./commands/RemoveTempRoleSlashCmd.js";
import { clearTempRole } from "./functions/clearTempRole.js";
import { RolesPluginType, zRolesConfig } from "./types.js";

export const RolesPlugin = guildPlugin<RolesPluginType>()({
  name: "roles",

  dependencies: () => [LogsPlugin, RoleManagerPlugin],
  configSchema: zRolesConfig,
  defaultOverrides: [
    {
      level: ">=50",
      config: {
        can_assign: true,
        can_assign_temp: true,
      },
    },
    {
      level: ">=100",
      config: {
        can_mass_assign: true,
      },
    },
  ],

  // prettier-ignore
  messageCommands: [
    AddRoleCmd,
    RemoveRoleCmd,
    AddTempRoleCmd,
    RemoveTempRoleCmd,
    MassAddRoleCmd,
    MassRemoveRoleCmd,
  ],

  slashCommands: [
    AddRoleSlashCmd,
    RemoveRoleSlashCmd,
    AddTempRoleSlashCmd,
    RemoveTempRoleSlashCmd,
  ],

  beforeLoad(pluginData) {
    const { state, guild } = pluginData;

    state.logs = new GuildLogs(guild.id);
    state.tempRoles = GuildTempRoles.getGuildInstance(guild.id);
  },

  beforeStart(pluginData) {
    pluginData.state.common = pluginData.getPlugin(CommonPlugin);
  },

  afterLoad(pluginData) {
    const { state, guild } = pluginData;

    state.unregisterGuildEventListener = onGuildEvent(guild.id, "expiredTempRole", (tempRole) =>
      clearTempRole(pluginData, tempRole),
    );
  },

  beforeUnload(pluginData) {
    pluginData.state.unregisterGuildEventListener?.();
  },
});
