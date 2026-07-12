import { guildPlugin } from "vety";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import { AnPanicCmd, AnPanicSlashCmd, AnStatusSlashCmd, AnWhitelistCmd } from "./commands/AntiNukeCmds.js";
import { AuditLogEvt } from "./events/AuditLogEvt.js";
import { AntiNukePluginType, antiNukeSlashGroup, zAntiNukeConfig } from "./types.js";

export const AntiNukePlugin = guildPlugin<AntiNukePluginType>()({
  name: "antinuke",

  configSchema: zAntiNukeConfig,
  defaultOverrides: [
    {
      level: ">=100",
      config: {
        can_manage: true,
      },
    },
  ],

  messageCommands: [AnPanicCmd, AnWhitelistCmd],

  slashCommands: [
    antiNukeSlashGroup({
      name: "antinuke",
      description: "Anti-nuke controls",
      defaultMemberPermissions: "0",
      subcommands: [AnPanicSlashCmd, AnStatusSlashCmd],
    }),
  ],

  events: [AuditLogEvt],

  beforeLoad(pluginData) {
    pluginData.state.actionLog = new Map();
    pluginData.state.panic = false;
    pluginData.state.panicRolePerms = new Map();
    pluginData.state.panicLockedChannels = new Set();
  },

  beforeStart(pluginData) {
    pluginData.state.common = pluginData.getPlugin(CommonPlugin);
  },

  afterLoad(pluginData) {
    // Config-level panic_mode marks session panic without re-running lockdown
    if (pluginData.config.get().panic_mode) {
      pluginData.state.panic = true;
    }
  },
});
