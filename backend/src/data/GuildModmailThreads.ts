import { Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository.js";
import { dataSource } from "./dataSource.js";
import { ModmailThread } from "./entities/ModmailThread.js";

export class GuildModmailThreads extends BaseGuildRepository {
  private threads: Repository<ModmailThread>;

  constructor(guildId: string) {
    super(guildId);
    this.threads = dataSource.getRepository(ModmailThread);
  }

  findOpenByUser(userId: string): Promise<ModmailThread | null> {
    return this.threads.findOne({ where: { guild_id: this.guildId, user_id: userId, status: "open" } });
  }

  findByChannelId(channelId: string): Promise<ModmailThread | null> {
    return this.threads.findOne({ where: { guild_id: this.guildId, channel_id: channelId } });
  }

  async create(channelId: string, userId: string, createdAt: string): Promise<ModmailThread> {
    const result = await this.threads.insert({
      guild_id: this.guildId,
      channel_id: channelId,
      user_id: userId,
      status: "open",
      created_at: createdAt,
      closed_at: null,
    });
    return (await this.threads.findOne({ where: { id: result.identifiers[0].id } }))!;
  }

  async close(channelId: string, closedAt: string): Promise<void> {
    await this.threads.update(
      { guild_id: this.guildId, channel_id: channelId },
      { status: "closed", closed_at: closedAt },
    );
  }
}
