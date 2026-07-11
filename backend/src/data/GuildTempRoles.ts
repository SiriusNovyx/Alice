import moment from "moment-timezone";
import { Repository } from "typeorm";
import { DBDateFormat } from "../utils.js";
import { BaseGuildRepository } from "./BaseGuildRepository.js";
import { dataSource } from "./dataSource.js";
import { TempRole } from "./entities/TempRole.js";

export class GuildTempRoles extends BaseGuildRepository {
  private tempRoles: Repository<TempRole>;

  constructor(guildId) {
    super(guildId);
    this.tempRoles = dataSource.getRepository(TempRole);
  }

  async getExpiredTempRoles(): Promise<TempRole[]> {
    return this.tempRoles
      .createQueryBuilder("temp_roles")
      .where("guild_id = :guild_id", { guild_id: this.guildId })
      .andWhere("expires_at IS NOT NULL")
      .andWhere("expires_at <= NOW()")
      .getMany();
  }

  async findExistingTempRoleForUserIdAndRoleId(userId: string, roleId: string): Promise<TempRole | null> {
    return this.tempRoles.findOne({
      where: {
        guild_id: this.guildId,
        user_id: userId,
        role_id: roleId,
      },
    });
  }

  async addTempRole(userId: string, roleId: string, expiryTimeMs: number, modId: string): Promise<TempRole> {
    const expiresAt = moment.utc().add(expiryTimeMs, "ms").format(DBDateFormat);

    const result = await this.tempRoles.insert({
      guild_id: this.guildId,
      user_id: userId,
      role_id: roleId,
      mod_id: modId,
      expires_at: expiresAt,
      created_at: moment.utc().format(DBDateFormat),
    });

    return (await this.tempRoles.findOne({ where: result.identifiers[0] }))!;
  }

  async updateExpiryTime(userId: string, roleId: string, newExpiryTimeMs: number, modId: string) {
    const expiresAt = moment.utc().add(newExpiryTimeMs, "ms").format(DBDateFormat);

    return this.tempRoles.update(
      {
        guild_id: this.guildId,
        user_id: userId,
        role_id: roleId,
      },
      {
        created_at: moment.utc().format(DBDateFormat),
        expires_at: expiresAt,
        mod_id: modId,
      },
    );
  }

  async clear(userId: string, roleId: string) {
    await this.tempRoles.delete({
      guild_id: this.guildId,
      user_id: userId,
      role_id: roleId,
    });
  }
}
