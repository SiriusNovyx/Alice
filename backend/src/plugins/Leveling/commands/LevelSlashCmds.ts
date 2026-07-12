import { slashOptions } from "vety";
import { levelingSlashCmd } from "../types.js";
import {
  actualLeaderboardCmd,
  actualRankCmd,
  actualResetCmd,
  actualSetXpCmd,
} from "./actualLevelCmds.js";

export const RankSlashCmd = levelingSlashCmd({
  name: "rank",
  configPermission: "can_check",
  description: "Show your or another member's level",
  allowDms: false,
  signature: [slashOptions.user({ name: "user", description: "Member to check", required: false })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualRankCmd(pluginData, interaction, options.user?.id ?? interaction.user.id);
  },
});

export const LeaderboardSlashCmd = levelingSlashCmd({
  name: "leaderboard",
  configPermission: "can_check",
  description: "Show the XP leaderboard",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualLeaderboardCmd(pluginData, interaction);
  },
});

export const SetXpSlashCmd = levelingSlashCmd({
  name: "setxp",
  configPermission: "can_manage",
  description: "Set a member's XP",
  allowDms: false,
  signature: [
    slashOptions.user({ name: "user", description: "Member", required: true }),
    slashOptions.integer({ name: "xp", description: "XP amount", required: true }),
  ],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualSetXpCmd(pluginData, interaction, options.user.id, options.xp);
  },
});

export const ResetSlashCmd = levelingSlashCmd({
  name: "reset",
  configPermission: "can_manage",
  description: "Reset all leveling data for this server",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualResetCmd(pluginData, interaction);
  },
});
