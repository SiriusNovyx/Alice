import { LessThanOrEqual, Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository.js";
import { dataSource } from "./dataSource.js";
import { Giveaway } from "./entities/Giveaway.js";

function parseJsonArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export class GuildGiveaways extends BaseGuildRepository {
  private giveaways: Repository<Giveaway>;

  constructor(guildId: string) {
    super(guildId);
    this.giveaways = dataSource.getRepository(Giveaway);
  }

  findByMessageId(messageId: string): Promise<Giveaway | null> {
    return this.giveaways.findOne({ where: { guild_id: this.guildId, message_id: messageId } });
  }

  findActive(): Promise<Giveaway[]> {
    return this.giveaways.find({ where: { guild_id: this.guildId, status: "active" } });
  }

  findDue(now: string): Promise<Giveaway[]> {
    return this.giveaways.find({
      where: {
        guild_id: this.guildId,
        status: "active",
        ends_at: LessThanOrEqual(now),
      },
    });
  }

  async create(data: {
    channel_id: string;
    message_id: string;
    host_id: string;
    prize: string;
    winner_count: number;
    ends_at: string;
    required_role_ids: string[];
    created_at: string;
  }): Promise<Giveaway> {
    const result = await this.giveaways.insert({
      guild_id: this.guildId,
      channel_id: data.channel_id,
      message_id: data.message_id,
      host_id: data.host_id,
      prize: data.prize,
      winner_count: data.winner_count,
      ends_at: data.ends_at,
      status: "active",
      entrants: "[]",
      required_role_ids: JSON.stringify(data.required_role_ids),
      winners: null,
      created_at: data.created_at,
    });
    return (await this.giveaways.findOne({ where: { id: result.identifiers[0].id } }))!;
  }

  getEntrants(row: Giveaway): string[] {
    return parseJsonArray(row.entrants);
  }

  getRequiredRoles(row: Giveaway): string[] {
    return parseJsonArray(row.required_role_ids);
  }

  getWinners(row: Giveaway): string[] {
    return parseJsonArray(row.winners);
  }

  async addEntrant(messageId: string, userId: string): Promise<boolean> {
    return dataSource.transaction(async (em) => {
      const repo = em.getRepository(Giveaway);
      const row = await repo.findOne({
        where: { guild_id: this.guildId, message_id: messageId },
        lock: { mode: "pessimistic_write" },
      });
      if (!row || row.status !== "active") return false;
      const entrants = parseJsonArray(row.entrants);
      if (entrants.includes(userId)) return false;
      entrants.push(userId);
      await repo.update(
        { guild_id: this.guildId, message_id: messageId },
        { entrants: JSON.stringify(entrants) },
      );
      return true;
    });
  }

  async removeEntrant(messageId: string, userId: string): Promise<boolean> {
    return dataSource.transaction(async (em) => {
      const repo = em.getRepository(Giveaway);
      const row = await repo.findOne({
        where: { guild_id: this.guildId, message_id: messageId },
        lock: { mode: "pessimistic_write" },
      });
      if (!row || row.status !== "active") return false;
      const entrants = parseJsonArray(row.entrants).filter((id) => id !== userId);
      await repo.update(
        { guild_id: this.guildId, message_id: messageId },
        { entrants: JSON.stringify(entrants) },
      );
      return true;
    });
  }

  async markEnded(messageId: string, winners: string[]): Promise<void> {
    await this.giveaways.update(
      { guild_id: this.guildId, message_id: messageId },
      { status: "ended", winners: JSON.stringify(winners) },
    );
  }

  async setWinners(messageId: string, winners: string[]): Promise<void> {
    await this.giveaways.update(
      { guild_id: this.guildId, message_id: messageId },
      { winners: JSON.stringify(winners) },
    );
  }
}
