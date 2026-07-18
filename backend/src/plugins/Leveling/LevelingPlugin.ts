import { guildPlugin } from "vety";
import { GuildUserLevels } from "../../data/GuildUserLevels.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import { LeaderboardCmd, LevelResetCmd, RankCmd, SetXpCmd } from "./commands/LevelCmds.js";
import { LeaderboardSlashCmd, RankSlashCmd, ResetSlashCmd, SetXpSlashCmd } from "./commands/LevelSlashCmds.js";
import { MessageCreateEvt } from "./events/MessageCreateEvt.js";
import { LevelingPluginType, levelingSlashGroup, zLevelingConfig } from "./types.js";

export const LevelingPlugin = guildPlugin<LevelingPluginType>()({
  name: "leveling",

  configSchema: zLevelingConfig,
  defaultOverrides: [
    {
      level: ">=50",
      config: {
        can_manage: true,
      },
    },
  ],

  // prettier-ignore
  messageCommands: [
    RankCmd,
    LeaderboardCmd,
    SetXpCmd,
    LevelResetCmd,
  ],

  slashCommands: [
    levelingSlashGroup({
      name: "level",
      description: "Leveling and XP",
      subcommands: [RankSlashCmd, LeaderboardSlashCmd, SetXpSlashCmd, ResetSlashCmd],
    }),
  ],

  events: [MessageCreateEvt],

  beforeLoad(pluginData) {
    pluginData.state.userLevels = GuildUserLevels.getGuildInstance(pluginData.guild.id);
    pluginData.state.cooldowns = new Map();
  },

  beforeStart(pluginData) {
    pluginData.state.common = pluginData.getPlugin(CommonPlugin);
  },
});
