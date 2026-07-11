import { guildPlugin } from "vety";
import { GuildRoleButtons } from "../../data/GuildRoleButtons.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import { LogsPlugin } from "../Logs/LogsPlugin.js";
import { RoleManagerPlugin } from "../RoleManager/RoleManagerPlugin.js";
import { ResetButtonsCmd } from "./commands/ResetButtonsCmd.js";
import { ResetButtonsSlashCmd } from "./commands/ResetButtonsSlashCmd.js";
import { onButtonInteraction } from "./events/buttonInteraction.js";
import { applyAllRoleButtons } from "./functions/applyAllRoleButtons.js";
import { RoleButtonsPluginType, roleButtonsSlashGroup, zRoleButtonsConfig } from "./types.js";

export const RoleButtonsPlugin = guildPlugin<RoleButtonsPluginType>()({
  name: "role_buttons",

  configSchema: zRoleButtonsConfig,
  defaultOverrides: [
    {
      level: ">=100",
      config: {
        can_reset: true,
      },
    },
  ],

  dependencies: () => [LogsPlugin, RoleManagerPlugin],

  events: [onButtonInteraction],

  messageCommands: [ResetButtonsCmd],

  slashCommands: [
    roleButtonsSlashGroup({
      name: "role_buttons",
      description: "Manage role buttons",
      defaultMemberPermissions: "0",
      subcommands: [ResetButtonsSlashCmd],
    }),
  ],

  beforeLoad(pluginData) {
    pluginData.state.roleButtons = GuildRoleButtons.getGuildInstance(pluginData.guild.id);
  },

  beforeStart(pluginData) {
    pluginData.state.common = pluginData.getPlugin(CommonPlugin);
  },

  async afterLoad(pluginData) {
    await applyAllRoleButtons(pluginData);
  },
});
