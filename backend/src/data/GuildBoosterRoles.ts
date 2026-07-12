import { Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository.js";
import { dataSource } from "./dataSource.js";
import { BoosterRole } from "./entities/BoosterRole.js";

export class GuildBoosterRoles extends BaseGuildRepository {
  private roles: Repository<BoosterRole>;

  constructor(guildId: string) {
    super(guildId);
    this.roles = dataSource.getRepository(BoosterRole);
  }

  findByUser(userId: string): Promise<BoosterRole | null> {
    return this.roles.findOne({ where: { guild_id: this.guildId, user_id: userId } });
  }

  async create(userId: string, roleId: string, createdAt: string): Promise<void> {
    await this.roles.insert({
      guild_id: this.guildId,
      user_id: userId,
      role_id: roleId,
      created_at: createdAt,
    });
  }

  async delete(userId: string): Promise<void> {
    await this.roles.delete({ guild_id: this.guildId, user_id: userId });
  }
}
