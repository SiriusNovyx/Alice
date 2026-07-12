import { Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository.js";
import { dataSource } from "./dataSource.js";
import { EconomyInventoryItem } from "./entities/EconomyInventoryItem.js";

export class GuildEconomyInventory extends BaseGuildRepository {
  private items: Repository<EconomyInventoryItem>;

  constructor(guildId: string) {
    super(guildId);
    this.items = dataSource.getRepository(EconomyInventoryItem);
  }

  list(userId: string): Promise<EconomyInventoryItem[]> {
    return this.items.find({ where: { guild_id: this.guildId, user_id: userId } });
  }

  async get(userId: string, itemId: string): Promise<EconomyInventoryItem | null> {
    return this.items.findOne({
      where: { guild_id: this.guildId, user_id: userId, item_id: itemId },
    });
  }

  async add(userId: string, itemId: string, qty = 1): Promise<void> {
    const existing = await this.get(userId, itemId);
    if (existing) {
      await this.items.update(
        { guild_id: this.guildId, user_id: userId, item_id: itemId },
        { quantity: existing.quantity + qty },
      );
    } else {
      await this.items.insert({
        guild_id: this.guildId,
        user_id: userId,
        item_id: itemId,
        quantity: qty,
      });
    }
  }

  async remove(userId: string, itemId: string, qty = 1): Promise<boolean> {
    const existing = await this.get(userId, itemId);
    if (!existing || existing.quantity < qty) return false;
    if (existing.quantity === qty) {
      await this.items.delete({ guild_id: this.guildId, user_id: userId, item_id: itemId });
    } else {
      await this.items.update(
        { guild_id: this.guildId, user_id: userId, item_id: itemId },
        { quantity: existing.quantity - qty },
      );
    }
    return true;
  }
}
