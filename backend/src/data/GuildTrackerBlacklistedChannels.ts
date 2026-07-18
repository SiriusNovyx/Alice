import { Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository.js";
import { dataSource } from "./dataSource.js";
import { TrackerBlacklistedChannel } from "./entities/TrackerBlacklistedChannel.js";

export class GuildTrackerBlacklistedChannels extends BaseGuildRepository {
  private rows: Repository<TrackerBlacklistedChannel>;

  constructor(guildId: string) {
    super(guildId);
    this.rows = dataSource.getRepository(TrackerBlacklistedChannel);
  }

  isBlacklisted(channelId: string): Promise<TrackerBlacklistedChannel | null> {
    return this.rows.findOne({ where: { guild_id: this.guildId, channel_id: channelId } });
  }

  list(): Promise<TrackerBlacklistedChannel[]> {
    return this.rows.find({ where: { guild_id: this.guildId } });
  }

  count(): Promise<number> {
    return this.rows.count({ where: { guild_id: this.guildId } });
  }

  async add(channelId: string, createdAt: string): Promise<void> {
    await this.rows
      .createQueryBuilder()
      .insert()
      .into(TrackerBlacklistedChannel)
      .values({ guild_id: this.guildId, channel_id: channelId, created_at: createdAt })
      .orIgnore()
      .execute();
  }

  async remove(channelId: string): Promise<void> {
    await this.rows.delete({ guild_id: this.guildId, channel_id: channelId });
  }
}
