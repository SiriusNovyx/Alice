import { Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository.js";
import { dataSource } from "./dataSource.js";
import { VoiceMasterChannel } from "./entities/VoiceMasterChannel.js";

export class GuildVoiceMasterChannels extends BaseGuildRepository {
  private channels: Repository<VoiceMasterChannel>;

  constructor(guildId: string) {
    super(guildId);
    this.channels = dataSource.getRepository(VoiceMasterChannel);
  }

  findByChannelId(channelId: string): Promise<VoiceMasterChannel | null> {
    return this.channels.findOne({
      where: {
        guild_id: this.guildId,
        channel_id: channelId,
      },
    });
  }

  findByOwnerId(ownerId: string): Promise<VoiceMasterChannel[]> {
    return this.channels.find({
      where: {
        guild_id: this.guildId,
        owner_id: ownerId,
      },
    });
  }

  async create(channelId: string, ownerId: string, createdAt: string): Promise<VoiceMasterChannel> {
    await this.channels.insert({
      guild_id: this.guildId,
      channel_id: channelId,
      owner_id: ownerId,
      created_at: createdAt,
    });
    return (await this.findByChannelId(channelId))!;
  }

  async setOwner(channelId: string, ownerId: string): Promise<void> {
    await this.channels.update(
      {
        guild_id: this.guildId,
        channel_id: channelId,
      },
      { owner_id: ownerId },
    );
  }

  async delete(channelId: string): Promise<void> {
    await this.channels.delete({
      guild_id: this.guildId,
      channel_id: channelId,
    });
  }
}
