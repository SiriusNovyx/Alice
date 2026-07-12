import { Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository.js";
import { dataSource } from "./dataSource.js";
import { ModmailBlacklist } from "./entities/ModmailBlacklist.js";

export class GuildModmailBlacklist extends BaseGuildRepository {
  private rows: Repository<ModmailBlacklist>;

  constructor(guildId: string) {
    super(guildId);
    this.rows = dataSource.getRepository(ModmailBlacklist);
  }

  isBlacklisted(userId: string): Promise<ModmailBlacklist | null> {
    return this.rows.findOne({ where: { guild_id: this.guildId, user_id: userId } });
  }

  async add(userId: string, createdAt: string): Promise<void> {
    await this.rows
      .createQueryBuilder()
      .insert()
      .into(ModmailBlacklist)
      .values({ guild_id: this.guildId, user_id: userId, created_at: createdAt })
      .orIgnore()
      .execute();
  }

  async remove(userId: string): Promise<void> {
    await this.rows.delete({ guild_id: this.guildId, user_id: userId });
  }
}
