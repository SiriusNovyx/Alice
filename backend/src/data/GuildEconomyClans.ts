import moment from "moment-timezone";
import { v4 as uuidv4 } from "uuid";
import { Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository.js";
import { dataSource } from "./dataSource.js";
import { EconomyClan } from "./entities/EconomyClan.js";
import { EconomyClanMember } from "./entities/EconomyClanMember.js";

export class GuildEconomyClans extends BaseGuildRepository {
  private clans: Repository<EconomyClan>;
  private members: Repository<EconomyClanMember>;

  constructor(guildId: string) {
    super(guildId);
    this.clans = dataSource.getRepository(EconomyClan);
    this.members = dataSource.getRepository(EconomyClanMember);
  }

  findById(id: string): Promise<EconomyClan | null> {
    return this.clans.findOne({ where: { id, guild_id: this.guildId } });
  }

  findByName(name: string): Promise<EconomyClan | null> {
    return this.clans.findOne({ where: { guild_id: this.guildId, name } });
  }

  findMember(userId: string): Promise<EconomyClanMember | null> {
    return this.members.findOne({ where: { guild_id: this.guildId, user_id: userId } });
  }

  listMembers(clanId: string): Promise<EconomyClanMember[]> {
    return this.members.find({ where: { guild_id: this.guildId, clan_id: clanId } });
  }

  async create(ownerId: string, name: string, tag: string): Promise<EconomyClan> {
    const id = uuidv4();
    const now = moment.utc().format("YYYY-MM-DD HH:mm:ss");
    await this.clans.insert({
      id,
      guild_id: this.guildId,
      name,
      tag: tag.slice(0, 5).toUpperCase(),
      owner_id: ownerId,
      bank: "0",
      level: 1,
      created_at: now,
    });
    await this.members.insert({
      guild_id: this.guildId,
      clan_id: id,
      user_id: ownerId,
      role: "owner",
      joined_at: now,
    });
    return (await this.findById(id))!;
  }

  async join(clanId: string, userId: string): Promise<boolean> {
    const clan = await this.findById(clanId);
    if (!clan) return false;
    const existing = await this.findMember(userId);
    if (existing) return false;
    await this.members.insert({
      guild_id: this.guildId,
      clan_id: clanId,
      user_id: userId,
      role: "member",
      joined_at: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
    });
    return true;
  }

  async leave(userId: string): Promise<boolean> {
    const membership = await this.findMember(userId);
    if (!membership) return false;
    if (membership.role === "owner") return false;
    await this.members.delete({
      guild_id: this.guildId,
      clan_id: membership.clan_id,
      user_id: userId,
    });
    return true;
  }
}
