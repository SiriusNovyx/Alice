import { GuildMember, TextChannel } from "discord.js";
import moment from "moment-timezone";
import { GuildPluginData } from "vety";
import { xpForLevel } from "../../../data/GuildUserLevels.js";
import { LevelingPluginType } from "../types.js";

export function rollXp(minXp: number, maxXp: number): number {
  const lo = Math.min(minXp, maxXp);
  const hi = Math.max(minXp, maxXp);
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

export function getMultiplier(pluginData: GuildPluginData<LevelingPluginType>, member: GuildMember): number {
  const config = pluginData.config.get();
  const applicable = config.multipliers.filter((m) => {
    if (m.type === "user") return m.target_id === member.id;
    return member.roles.cache.has(m.target_id);
  });
  if (applicable.length === 0) return 1;
  if (config.stack_multipliers) {
    return applicable.reduce((acc, m) => acc * m.multiplier, 1);
  }
  return Math.max(...applicable.map((m) => m.multiplier));
}

export async function applyRoleRewards(
  pluginData: GuildPluginData<LevelingPluginType>,
  member: GuildMember,
  level: number,
): Promise<void> {
  const rewards = pluginData.config.get().role_rewards.filter((r) => r.level <= level);
  for (const reward of rewards) {
    if (!member.roles.cache.has(reward.role_id)) {
      await member.roles.add(reward.role_id).catch(() => null);
    }
  }
}

export async function handleMessageXp(
  pluginData: GuildPluginData<LevelingPluginType>,
  member: GuildMember,
  channelId: string,
): Promise<void> {
  const config = pluginData.config.get();
  if (!config.enabled) return;
  if (member.user.bot) return;
  if (config.excluded_channels.includes(channelId)) return;
  if (config.excluded_roles.some((r) => member.roles.cache.has(r))) return;

  const now = Date.now();
  const last = pluginData.state.cooldowns.get(member.id) ?? 0;
  if (now - last < config.cooldown_seconds * 1000) return;

  const existing = await pluginData.state.userLevels.getOrCreate(member.id);
  if (existing.last_message_at) {
    const lastAt = moment.utc(existing.last_message_at).valueOf();
    if (now - lastAt < config.cooldown_seconds * 1000) {
      pluginData.state.cooldowns.set(member.id, lastAt);
      return;
    }
  }

  // Set cooldown only once we commit to awarding XP
  pluginData.state.cooldowns.set(member.id, now);

  const amount = Math.round(rollXp(config.min_xp, config.max_xp) * getMultiplier(pluginData, member));
  const oldLevel = existing.level;
  const updated = await pluginData.state.userLevels.addXp(
    member.id,
    amount,
    moment.utc().format("YYYY-MM-DD HH:mm:ss"),
  );

  if (updated.level > oldLevel) {
    await applyRoleRewards(pluginData, member, updated.level);
    const text = config.level_up_message
      .replaceAll("{user}", `<@${member.id}>`)
      .replaceAll("{level}", String(updated.level))
      .replaceAll("{xp}", String(updated.xp));

    const targetId = config.level_up_channel_id ?? channelId;
    const channel = pluginData.guild.channels.cache.get(targetId) as TextChannel | undefined;
    if (channel?.isSendable()) {
      await channel.send({ content: text }).catch(() => null);
    }
  }
}

export function formatRankLine(userId: string, xp: number, level: number, rank: number): string {
  const next = xpForLevel(level + 1);
  return `**#${rank}** <@${userId}> — Level **${level}** (${xp}/${next} XP)`;
}
