import moment from "moment-timezone";
import { v4 as uuidv4 } from "uuid";
import { Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository.js";
import { dataSource } from "./dataSource.js";
import { EconomyCreature } from "./entities/EconomyCreature.js";

export class GuildEconomyCreatures extends BaseGuildRepository {
  private creatures: Repository<EconomyCreature>;

  constructor(guildId: string) {
    super(guildId);
    this.creatures = dataSource.getRepository(EconomyCreature);
  }

  list(userId: string): Promise<EconomyCreature[]> {
    return this.creatures.find({ where: { guild_id: this.guildId, user_id: userId } });
  }

  count(userId: string): Promise<number> {
    return this.creatures.count({ where: { guild_id: this.guildId, user_id: userId } });
  }

  team(userId: string): Promise<EconomyCreature[]> {
    return this.creatures.find({ where: { guild_id: this.guildId, user_id: userId, is_team: true } });
  }

  findById(id: string): Promise<EconomyCreature | null> {
    return this.creatures.findOne({ where: { id, guild_id: this.guildId } });
  }

  async catch(
    userId: string,
    data: {
      creature_key: string;
      name: string;
      rarity: string;
      hp: number;
      attack: number;
      defense: number;
      speed: number;
    },
  ): Promise<EconomyCreature> {
    const id = uuidv4();
    await this.creatures.insert({
      id,
      guild_id: this.guildId,
      user_id: userId,
      ...data,
      is_team: false,
      caught_at: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
    });
    return (await this.findById(id))!;
  }

  async setTeam(userId: string, creatureId: string, onTeam: boolean): Promise<boolean> {
    const c = await this.findById(creatureId);
    if (!c || c.user_id !== userId) return false;
    await this.creatures.update({ id: creatureId, guild_id: this.guildId }, { is_team: onTeam });
    return true;
  }

  async release(userId: string, creatureId: string): Promise<boolean> {
    const c = await this.findById(creatureId);
    if (!c || c.user_id !== userId) return false;
    await this.creatures.delete({ id: creatureId, guild_id: this.guildId });
    return true;
  }
}
