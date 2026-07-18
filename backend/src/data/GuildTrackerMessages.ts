import { Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository.js";
import { dataSource } from "./dataSource.js";
import { TrackerDailyMessageCount } from "./entities/TrackerDailyMessageCount.js";
import { TrackerMessageCount } from "./entities/TrackerMessageCount.js";

export class GuildTrackerMessages extends BaseGuildRepository {
  private totals: Repository<TrackerMessageCount>;
  private daily: Repository<TrackerDailyMessageCount>;

  constructor(guildId: string) {
    super(guildId);
    this.totals = dataSource.getRepository(TrackerMessageCount);
    this.daily = dataSource.getRepository(TrackerDailyMessageCount);
  }

  findTotal(userId: string): Promise<TrackerMessageCount | null> {
    return this.totals.findOne({ where: { guild_id: this.guildId, user_id: userId } });
  }

  findDaily(userId: string, date: string): Promise<TrackerDailyMessageCount | null> {
    return this.daily.findOne({ where: { guild_id: this.guildId, user_id: userId, date } });
  }

  async increment(userId: string, date: string): Promise<void> {
    await dataSource.query(
      `INSERT INTO tracker_message_counts (guild_id, user_id, count) VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE count = count + 1`,
      [this.guildId, userId],
    );
    await dataSource.query(
      `INSERT INTO tracker_daily_message_counts (guild_id, user_id, date, count) VALUES (?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE count = count + 1`,
      [this.guildId, userId, date],
    );
  }

  getLeaderboard(limit: number): Promise<TrackerMessageCount[]> {
    return this.totals.find({
      where: { guild_id: this.guildId },
      order: { count: "DESC" },
      take: limit,
    });
  }

  async sumTotals(): Promise<number> {
    const result = await this.totals
      .createQueryBuilder("t")
      .select("COALESCE(SUM(t.count), 0)", "total")
      .where("t.guild_id = :guildId", { guildId: this.guildId })
      .getRawOne<{ total: string }>();
    return Number(result?.total ?? 0);
  }

  async sumDaily(date: string): Promise<number> {
    const result = await this.daily
      .createQueryBuilder("d")
      .select("COALESCE(SUM(d.count), 0)", "total")
      .where("d.guild_id = :guildId", { guildId: this.guildId })
      .andWhere("d.date = :date", { date })
      .getRawOne<{ total: string }>();
    return Number(result?.total ?? 0);
  }

  countUsers(): Promise<number> {
    return this.totals.count({ where: { guild_id: this.guildId } });
  }

  async resetAll(): Promise<void> {
    await this.totals.delete({ guild_id: this.guildId });
    await this.daily.delete({ guild_id: this.guildId });
  }
}
