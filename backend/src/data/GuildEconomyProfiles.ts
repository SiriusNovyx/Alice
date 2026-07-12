import { Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository.js";
import { dataSource } from "./dataSource.js";
import { EconomyProfile } from "./entities/EconomyProfile.js";

export class GuildEconomyProfiles extends BaseGuildRepository {
  private profiles: Repository<EconomyProfile>;

  constructor(guildId: string) {
    super(guildId);
    this.profiles = dataSource.getRepository(EconomyProfile);
  }

  find(userId: string): Promise<EconomyProfile | null> {
    return this.profiles.findOne({ where: { guild_id: this.guildId, user_id: userId } });
  }

  async getOrCreate(userId: string): Promise<EconomyProfile> {
    const existing = await this.find(userId);
    if (existing) return existing;
    await this.profiles.insert({
      guild_id: this.guildId,
      user_id: userId,
      cash: "0",
      bank: "0",
      gems: "0",
      bank_limit: "100000",
      married_to: null,
      clan_id: null,
      rob_protection_until: null,
      last_work: null,
      last_crime: null,
      last_daily: null,
      last_weekly: null,
      last_hunt: null,
      last_battle: null,
      last_beg: null,
      last_rob: null,
      last_slots: null,
    });
    return (await this.find(userId))!;
  }

  async addCash(userId: string, amount: number, extras: Partial<EconomyProfile> = {}): Promise<EconomyProfile> {
    const row = await this.getOrCreate(userId);
    const cash = String(BigInt(row.cash) + BigInt(amount));
    await this.profiles.update({ guild_id: this.guildId, user_id: userId }, { cash, ...extras });
    return (await this.find(userId))!;
  }

  async addGems(userId: string, amount: number): Promise<EconomyProfile> {
    const row = await this.getOrCreate(userId);
    const gems = String(BigInt(row.gems) + BigInt(amount));
    await this.profiles.update({ guild_id: this.guildId, user_id: userId }, { gems });
    return (await this.find(userId))!;
  }

  async transfer(fromId: string, toId: string, amount: number): Promise<boolean> {
    const from = await this.getOrCreate(fromId);
    if (BigInt(from.cash) < BigInt(amount)) return false;
    await this.addCash(fromId, -amount);
    await this.addCash(toId, amount);
    return true;
  }

  async deposit(userId: string, amount: number): Promise<boolean> {
    const row = await this.getOrCreate(userId);
    if (BigInt(row.cash) < BigInt(amount)) return false;
    const nextBank = BigInt(row.bank) + BigInt(amount);
    if (nextBank > BigInt(row.bank_limit)) return false;
    const cash = String(BigInt(row.cash) - BigInt(amount));
    const bank = String(nextBank);
    await this.profiles.update({ guild_id: this.guildId, user_id: userId }, { cash, bank });
    return true;
  }

  async withdraw(userId: string, amount: number): Promise<boolean> {
    const row = await this.getOrCreate(userId);
    if (BigInt(row.bank) < BigInt(amount)) return false;
    const cash = String(BigInt(row.cash) + BigInt(amount));
    const bank = String(BigInt(row.bank) - BigInt(amount));
    await this.profiles.update({ guild_id: this.guildId, user_id: userId }, { cash, bank });
    return true;
  }

  async setMarried(userId: string, partnerId: string | null): Promise<void> {
    await this.getOrCreate(userId);
    await this.profiles.update({ guild_id: this.guildId, user_id: userId }, { married_to: partnerId });
  }

  async setClan(userId: string, clanId: string | null): Promise<void> {
    await this.getOrCreate(userId);
    await this.profiles.update({ guild_id: this.guildId, user_id: userId }, { clan_id: clanId });
  }

  async setRobProtection(userId: string, until: string | null): Promise<void> {
    await this.getOrCreate(userId);
    await this.profiles.update({ guild_id: this.guildId, user_id: userId }, { rob_protection_until: until });
  }

  async expandBank(userId: string, amount: number): Promise<void> {
    const row = await this.getOrCreate(userId);
    const bank_limit = String(BigInt(row.bank_limit) + BigInt(amount));
    await this.profiles.update({ guild_id: this.guildId, user_id: userId }, { bank_limit });
  }

  getLeaderboard(limit: number): Promise<EconomyProfile[]> {
    return this.profiles.find({
      where: { guild_id: this.guildId },
      order: { cash: "DESC" },
      take: limit,
    });
  }
}
