import { Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository.js";
import { dataSource } from "./dataSource.js";
import { BotProfileConfig } from "./entities/BotProfileConfig.js";

export class GuildBotProfiles extends BaseGuildRepository {
  private profiles: Repository<BotProfileConfig>;

  constructor(guildId: string) {
    super(guildId);
    this.profiles = dataSource.getRepository(BotProfileConfig);
  }

  get(): Promise<BotProfileConfig | null> {
    return this.profiles.findOne({ where: { guild_id: this.guildId } });
  }

  async set(data: {
    nick?: string | null;
    avatar?: string | null;
    banner?: string | null;
    bio?: string | null;
    updated_at: string;
  }): Promise<BotProfileConfig> {
    const existing = await this.get();
    if (existing) {
      await this.profiles.update({ guild_id: this.guildId }, data);
    } else {
      await this.profiles.insert({
        guild_id: this.guildId,
        nick: data.nick ?? null,
        avatar: data.avatar ?? null,
        banner: data.banner ?? null,
        bio: data.bio ?? null,
        updated_at: data.updated_at,
      });
    }
    return (await this.get())!;
  }

  async clear(): Promise<void> {
    await this.profiles.delete({ guild_id: this.guildId });
  }
}
