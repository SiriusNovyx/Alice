import moment from "moment-timezone";
import { Repository } from "typeorm";
import { DBDateFormat } from "../utils.js";
import { BaseRepository } from "./BaseRepository.js";
import { dataSource } from "./dataSource.js";
import { TempRole } from "./entities/TempRole.js";

export class TempRoles extends BaseRepository {
  private tempRoles: Repository<TempRole>;

  constructor() {
    super();
    this.tempRoles = dataSource.getRepository(TempRole);
  }

  getSoonExpiringTempRoles(threshold: number): Promise<TempRole[]> {
    const thresholdDateStr = moment.utc().add(threshold, "ms").format(DBDateFormat);
    return this.tempRoles.createQueryBuilder().where("expires_at <= :date", { date: thresholdDateStr }).getMany();
  }

  findTempRole(guildId: string, userId: string, roleId: string): Promise<TempRole | null> {
    return this.tempRoles.findOne({
      where: {
        guild_id: guildId,
        user_id: userId,
        role_id: roleId,
      },
    });
  }
}
