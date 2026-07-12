import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { levelingCmd } from "../types.js";
import {
  actualLeaderboardCmd,
  actualRankCmd,
  actualResetCmd,
  actualSetXpCmd,
} from "./actualLevelCmds.js";

export const RankCmd = levelingCmd({
  trigger: ["rank", "level", "xp"],
  usage: "!rank [user]",
  permission: "can_check",
  signature: {
    user: ct.resolvedUser({ required: false }),
  },
  async run({ message: msg, args, pluginData }) {
    await actualRankCmd(pluginData, msg, args.user?.id ?? msg.author.id);
  },
});

export const LeaderboardCmd = levelingCmd({
  trigger: ["leaderboard", "levels", "toplevels"],
  usage: "!leaderboard",
  permission: "can_check",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualLeaderboardCmd(pluginData, msg);
  },
});

export const SetXpCmd = levelingCmd({
  trigger: ["setxp", "set-xp"],
  usage: "!setxp <user> <xp>",
  permission: "can_manage",
  signature: {
    user: ct.resolvedUser(),
    xp: ct.number(),
  },
  async run({ message: msg, args, pluginData }) {
    await actualSetXpCmd(pluginData, msg, args.user.id, args.xp);
  },
});

export const LevelResetCmd = levelingCmd({
  trigger: ["levelreset", "resetlevels"],
  usage: "!levelreset",
  permission: "can_manage",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualResetCmd(pluginData, msg);
  },
});
