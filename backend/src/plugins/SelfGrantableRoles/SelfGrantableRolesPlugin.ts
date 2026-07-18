import { CooldownManager, guildPlugin } from "vety";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import { RoleAddCmd } from "./commands/RoleAddCmd.js";
import { RoleAddSlashCmd } from "./commands/RoleAddSlashCmd.js";
import { RoleHelpCmd } from "./commands/RoleHelpCmd.js";
import { RoleHelpSlashCmd } from "./commands/RoleHelpSlashCmd.js";
import { RoleRemoveCmd } from "./commands/RoleRemoveCmd.js";
import { RoleRemoveSlashCmd } from "./commands/RoleRemoveSlashCmd.js";
import { SelfGrantableRolesPluginType, selfGrantableRolesSlashGroup, zSelfGrantableRolesConfig } from "./types.js";

export const SelfGrantableRolesPlugin = guildPlugin<SelfGrantableRolesPluginType>()({
  name: "self_grantable_roles",

  configSchema: zSelfGrantableRolesConfig,

  // prettier-ignore
  messageCommands: [
    RoleHelpCmd,
    RoleRemoveCmd,
    RoleAddCmd,
  ],

  slashCommands: [
    selfGrantableRolesSlashGroup({
      name: "srole",
      description: "Self-grantable roles",
      subcommands: [RoleAddSlashCmd, RoleRemoveSlashCmd, RoleHelpSlashCmd],
    }),
  ],

  beforeLoad(pluginData) {
    pluginData.state.cooldowns = new CooldownManager();
  },

  beforeStart(pluginData) {
    pluginData.state.common = pluginData.getPlugin(CommonPlugin);
  },
});
