import { guildPlugin } from "vety";
import { GuildBoosterRoles } from "../../data/GuildBoosterRoles.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import {
  BoosterColorCmd,
  BoosterColorSlashCmd,
  BoosterCreateCmd,
  BoosterCreateSlashCmd,
  BoosterDeleteCmd,
  BoosterDeleteSlashCmd,
  BoosterMemberUpdateEvt,
  BoosterNameSlashCmd,
  BoosterRenameCmd,
} from "./commands/BoosterRolesCmds.js";
import { BoosterRolesPluginType, boosterRolesSlashGroup, zBoosterRolesConfig } from "./types.js";

export const BoosterRolesPlugin = guildPlugin<BoosterRolesPluginType>()({
  name: "booster_roles",
  configSchema: zBoosterRolesConfig,
  messageCommands: [BoosterCreateCmd, BoosterRenameCmd, BoosterColorCmd, BoosterDeleteCmd],
  slashCommands: [
    boosterRolesSlashGroup({
      name: "boosterrole",
      description: "Booster personal roles",
      subcommands: [BoosterCreateSlashCmd, BoosterNameSlashCmd, BoosterColorSlashCmd, BoosterDeleteSlashCmd],
    }),
  ],
  events: [BoosterMemberUpdateEvt],
  beforeLoad(pluginData) {
    pluginData.state.boosterRoles = GuildBoosterRoles.getGuildInstance(pluginData.guild.id);
  },
  beforeStart(pluginData) {
    pluginData.state.common = pluginData.getPlugin(CommonPlugin);
  },
});
