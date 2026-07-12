import { Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository.js";
import { dataSource } from "./dataSource.js";
import { UserLevel } from "./entities/UserLevel.js";

export class GuildUserLevels extends BaseGuildRepository {
  private levels: Repository<UserLevel>;

  constructor(guildId: string) {
    super(guildId);
    this.levels = dataSource.getRepository(UserLevel);
  }

  find(userId: string): Promise<UserLevel | null> {
    return this.levels.findOne({
      where: { guild_id: this.guildId, user_id: userId },
    });
  }

  async getOrCreate(userId: string): Promise<UserLevel> {
    const existing = await this.find(userId);
    if (existing) return existing;
    await this.levels.insert({
      guild_id: this.guildId,
      user_id: userId,
      xp: 0,
      level: 0,
      total_xp: 0,
      last_message_at: null,
    });
    return (await this.find(userId))!;
  }

  async addXp(userId: string, amount: number, lastMessageAt: string): Promise<UserLevel> {
    const row = await this.getOrCreate(userId);
    const xp = row.xp + amount;
    const totalXp = row.total_xp + amount;
    const level = xpToLevel(xp);
    await this.levels.update(
      { guild_id: this.guildId, user_id: userId },
      { xp, total_xp: totalXp, level, last_message_at: lastMessageAt },
    );
    return (await this.find(userId))!;
  }

  async setXp(userId: string, xp: number): Promise<UserLevel> {
    await this.getOrCreate(userId);
    const level = xpToLevel(xp);
    await this.levels.update(
      { guild_id: this.guildId, user_id: userId },
      { xp, level, total_xp: xp },
    );
    return (await this.find(userId))!;
  }

  async resetAll(): Promise<void> {
    await this.levels.delete({ guild_id: this.guildId });
  }

  getLeaderboard(limit: number): Promise<UserLevel[]> {
    return this.levels.find({
      where: { guild_id: this.guildId },
      order: { xp: "DESC" },
      take: limit,
    });
  }

  async getRank(userId: string): Promise<number> {
    const row = await this.find(userId);
    if (!row) return 0;
    const ahead = await this.levels
      .createQueryBuilder("ul")
      .where("ul.guild_id = :guildId", { guildId: this.guildId })
      .andWhere("ul.xp > :xp", { xp: row.xp })
      .getCount();
    return ahead + 1;
  }
}

/** Classic Mee6-style: XP required for level L is 5L^2 + 50L + 100 cumulative via inverse. */
export function xpForLevel(level: number): number {
  if (level <= 0) return 0;
  let total = 0;
  for (let i = 0; i < level; i++) {
    total += 5 * i * i + 50 * i + 100;
  }
  return total;
}

export function xpToLevel(xp: number): number {
  let level = 0;
  while (xpForLevel(level + 1) <= xp) {
    level++;
    if (level > 1000) break;
  }
  return level;
}
