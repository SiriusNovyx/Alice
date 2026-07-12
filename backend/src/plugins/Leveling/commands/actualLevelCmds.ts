import { GuildPluginData } from "vety";
import { GenericCommandSource } from "../../../pluginUtils.js";
import { xpForLevel } from "../../../data/GuildUserLevels.js";
import { formatRankLine } from "../functions/xp.js";
import { LevelingPluginType } from "../types.js";

export async function actualRankCmd(
  pluginData: GuildPluginData<LevelingPluginType>,
  context: GenericCommandSource,
  userId: string,
): Promise<void> {
  const row = await pluginData.state.userLevels.getOrCreate(userId);
  const next = xpForLevel(row.level + 1);
  const rank = await pluginData.state.userLevels.getRank(userId);
  await pluginData.state.common.sendSuccessMessage(
    context,
    `<@${userId}> is **#${rank}** — level **${row.level}** with **${row.xp}** XP (${Math.max(0, next - row.xp)} XP to next level).`,
  );
}

export async function actualLeaderboardCmd(
  pluginData: GuildPluginData<LevelingPluginType>,
  context: GenericCommandSource,
): Promise<void> {
  const rows = await pluginData.state.userLevels.getLeaderboard(10);
  if (rows.length === 0) {
    await pluginData.state.common.sendErrorMessage(context, "No XP data yet.");
    return;
  }
  const lines = rows.map((r, i) => formatRankLine(r.user_id, r.xp, r.level, i + 1));
  await pluginData.state.common.sendSuccessMessage(context, `**Leaderboard**\n${lines.join("\n")}`);
}

export async function actualSetXpCmd(
  pluginData: GuildPluginData<LevelingPluginType>,
  context: GenericCommandSource,
  userId: string,
  xp: number,
): Promise<void> {
  if (xp < 0) {
    await pluginData.state.common.sendErrorMessage(context, "XP must be >= 0.");
    return;
  }
  const row = await pluginData.state.userLevels.setXp(userId, xp);
  const member = await pluginData.guild.members.fetch(userId).catch(() => null);
  if (member) {
    const { applyRoleRewards } = await import("../functions/xp.js");
    await applyRoleRewards(pluginData, member, row.level);
  }
  await pluginData.state.common.sendSuccessMessage(
    context,
    `Set <@${userId}> to **${row.xp}** XP (level **${row.level}**).`,
  );
}

export async function actualResetCmd(
  pluginData: GuildPluginData<LevelingPluginType>,
  context: GenericCommandSource,
): Promise<void> {
  await pluginData.state.userLevels.resetAll();
  pluginData.state.cooldowns.clear();
  await pluginData.state.common.sendSuccessMessage(context, "All leveling data for this server has been reset.");
}
