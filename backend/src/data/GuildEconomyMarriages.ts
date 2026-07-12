import moment from "moment-timezone";
import { Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository.js";
import { dataSource } from "./dataSource.js";
import { EconomyMarriage } from "./entities/EconomyMarriage.js";

export class GuildEconomyMarriages extends BaseGuildRepository {
  private marriages: Repository<EconomyMarriage>;

  constructor(guildId: string) {
    super(guildId);
    this.marriages = dataSource.getRepository(EconomyMarriage);
  }

  async findForUser(userId: string): Promise<EconomyMarriage | null> {
    const as1 = await this.marriages.findOne({ where: { guild_id: this.guildId, user1_id: userId } });
    if (as1) return as1;
    return this.marriages.findOne({ where: { guild_id: this.guildId, user2_id: userId } });
  }

  async marry(user1: string, user2: string): Promise<boolean> {
    if (await this.findForUser(user1)) return false;
    if (await this.findForUser(user2)) return false;
    const [a, b] = user1 < user2 ? [user1, user2] : [user2, user1];
    await this.marriages.insert({
      guild_id: this.guildId,
      user1_id: a,
      user2_id: b,
      married_at: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
    });
    return true;
  }

  async divorce(userId: string): Promise<boolean> {
    const m = await this.findForUser(userId);
    if (!m) return false;
    await this.marriages.delete({
      guild_id: this.guildId,
      user1_id: m.user1_id,
      user2_id: m.user2_id,
    });
    return true;
  }
}
