import { guildPlugin } from "vety";
import { GuildSavedMessages } from "../../data/GuildSavedMessages.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import { SaveMessagesToDBCmd } from "./commands/SaveMessagesToDBCmd.js";
import { SaveMessagesToDBSlashCmd } from "./commands/SaveMessagesToDBSlashCmd.js";
import { SavePinsToDBCmd } from "./commands/SavePinsToDBCmd.js";
import { SavePinsToDBSlashCmd } from "./commands/SavePinsToDBSlashCmd.js";
import {
  MessageCreateEvt,
  MessageDeleteBulkEvt,
  MessageDeleteEvt,
  MessageUpdateEvt,
} from "./events/SaveMessagesEvts.js";
import { MessageSaverPluginType, messageSaverSlashGroup, zMessageSaverConfig } from "./types.js";

export const MessageSaverPlugin = guildPlugin<MessageSaverPluginType>()({
  name: "message_saver",

  configSchema: zMessageSaverConfig,
  defaultOverrides: [
    {
      level: ">=100",
      config: {
        can_manage: true,
      },
    },
  ],

  // prettier-ignore
  messageCommands: [
    SaveMessagesToDBCmd,
    SavePinsToDBCmd,
  ],

  slashCommands: [
    messageSaverSlashGroup({
      name: "message_saver",
      description: "Save messages to the database",
      defaultMemberPermissions: "0",
      subcommands: [SaveMessagesToDBSlashCmd, SavePinsToDBSlashCmd],
    }),
  ],

  // prettier-ignore
  events: [
    MessageCreateEvt,
    MessageUpdateEvt,
    MessageDeleteEvt,
    MessageDeleteBulkEvt,
  ],

  beforeLoad(pluginData) {
    const { state, guild } = pluginData;
    state.savedMessages = GuildSavedMessages.getGuildInstance(guild.id);
  },

  beforeStart(pluginData) {
    pluginData.state.common = pluginData.getPlugin(CommonPlugin);
  },
});
