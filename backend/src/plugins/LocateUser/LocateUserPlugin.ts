import { guildPlugin } from "vety";
import { onGuildEvent } from "../../data/GuildEvents.js";
import { GuildVCAlerts } from "../../data/GuildVCAlerts.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import { FollowCmd } from "./commands/FollowCmd.js";
import { FollowSlashCmd } from "./commands/FollowSlashCmd.js";
import { FollowsSlashCmd } from "./commands/FollowsSlashCmd.js";
import { DeleteFollowCmd, ListFollowCmd } from "./commands/ListFollowCmd.js";
import { UnfollowSlashCmd } from "./commands/UnfollowSlashCmd.js";
import { WhereCmd } from "./commands/WhereCmd.js";
import { WhereSlashCmd } from "./commands/WhereSlashCmd.js";
import { GuildBanRemoveAlertsEvt } from "./events/BanRemoveAlertsEvt.js";
import { VoiceStateUpdateAlertEvt } from "./events/SendAlertsEvts.js";
import { LocateUserPluginType, locateUserSlashGroup, zLocateUserConfig } from "./types.js";
import { clearExpiredAlert } from "./utils/clearExpiredAlert.js";
import { fillActiveAlertsList } from "./utils/fillAlertsList.js";

export const LocateUserPlugin = guildPlugin<LocateUserPluginType>()({
  name: "locate_user",

  configSchema: zLocateUserConfig,
  defaultOverrides: [
    {
      level: ">=50",
      config: {
        can_where: true,
        can_alert: true,
      },
    },
  ],

  // prettier-ignore
  messageCommands: [
    WhereCmd,
    FollowCmd,
    ListFollowCmd,
    DeleteFollowCmd,
  ],

  slashCommands: [
    locateUserSlashGroup({
      name: "locate",
      description: "Locate users in voice channels",
      defaultMemberPermissions: "0",
      subcommands: [WhereSlashCmd, FollowSlashCmd, FollowsSlashCmd, UnfollowSlashCmd],
    }),
  ],

  // prettier-ignore
  events: [
    VoiceStateUpdateAlertEvt,
    GuildBanRemoveAlertsEvt
  ],

  beforeLoad(pluginData) {
    const { state, guild } = pluginData;

    state.alerts = GuildVCAlerts.getGuildInstance(guild.id);
    state.usersWithAlerts = [];
  },

  beforeStart(pluginData) {
    pluginData.state.common = pluginData.getPlugin(CommonPlugin);
  },

  afterLoad(pluginData) {
    const { state, guild } = pluginData;

    state.unregisterGuildEventListener = onGuildEvent(guild.id, "expiredVCAlert", (alert) =>
      clearExpiredAlert(pluginData, alert),
    );
    fillActiveAlertsList(pluginData);
  },

  beforeUnload(pluginData) {
    const { state } = pluginData;

    state.unregisterGuildEventListener?.();
  },
});
