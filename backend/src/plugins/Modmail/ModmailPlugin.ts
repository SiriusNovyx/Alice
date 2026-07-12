import { guildPlugin } from "vety";
import { GuildArchives } from "../../data/GuildArchives.js";
import { GuildModmailBlacklist } from "../../data/GuildModmailBlacklist.js";
import { GuildModmailThreads } from "../../data/GuildModmailThreads.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import {
  MmAReplyCmd,
  MmBlacklistCmd,
  MmCloseCmd,
  MmReplyCmd,
  MmSnippetListCmd,
  MmSnippetUseCmd,
  MmUnblacklistCmd,
} from "./commands/ModmailCmds.js";
import {
  MmAReplySlashCmd,
  MmBlacklistSlashCmd,
  MmCloseSlashCmd,
  MmReplySlashCmd,
  MmSnippetListSlashCmd,
  MmSnippetUseSlashCmd,
  MmUnblacklistSlashCmd,
} from "./commands/ModmailSlashCmds.js";
import { registerModmailGuild, unregisterModmailGuild } from "./functions/modmailDmRouter.js";
import { ModmailPluginType, modmailSlashGroup, zModmailConfig } from "./types.js";

export const ModmailPlugin = guildPlugin<ModmailPluginType>()({
  name: "modmail",

  configSchema: zModmailConfig,
  defaultOverrides: [
    {
      level: ">=50",
      config: {
        can_reply: true,
        can_close: true,
        can_manage: true,
      },
    },
  ],

  // prettier-ignore
  messageCommands: [
    MmReplyCmd,
    MmAReplyCmd,
    MmCloseCmd,
    MmBlacklistCmd,
    MmUnblacklistCmd,
    MmSnippetListCmd,
    MmSnippetUseCmd,
  ],

  slashCommands: [
    modmailSlashGroup({
      name: "modmail",
      description: "Modmail",
      defaultMemberPermissions: "0",
      subcommands: [
        MmReplySlashCmd,
        MmAReplySlashCmd,
        MmCloseSlashCmd,
        MmBlacklistSlashCmd,
        MmUnblacklistSlashCmd,
        MmSnippetListSlashCmd,
        MmSnippetUseSlashCmd,
      ],
    }),
  ],

  beforeLoad(pluginData) {
    pluginData.state.threads = GuildModmailThreads.getGuildInstance(pluginData.guild.id);
    pluginData.state.blacklist = GuildModmailBlacklist.getGuildInstance(pluginData.guild.id);
    pluginData.state.archives = GuildArchives.getGuildInstance(pluginData.guild.id);
  },

  beforeStart(pluginData) {
    pluginData.state.common = pluginData.getPlugin(CommonPlugin);
  },

  afterLoad(pluginData) {
    registerModmailGuild(pluginData);
  },

  beforeUnload(pluginData) {
    unregisterModmailGuild(pluginData.guild.id);
  },
});
