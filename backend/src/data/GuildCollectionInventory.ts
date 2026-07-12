import { Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository.js";
import { dataSource } from "./dataSource.js";
import { CollectionItem } from "./entities/CollectionItem.js";

export class GuildCollectionInventory extends BaseGuildRepository {
  private items: Repository<CollectionItem>;

  constructor(guildId: string) {
    super(guildId);
    this.items = dataSource.getRepository(CollectionItem);
  }

  list(userId: string): Promise<CollectionItem[]> {
    return this.items.find({ where: { guild_id: this.guildId, user_id: userId } });
  }

  async get(userId: string, itemKey: string): Promise<CollectionItem | null> {
    return this.items.findOne({
      where: { guild_id: this.guildId, user_id: userId, item_key: itemKey },
    });
  }

  async add(userId: string, itemKey: string, qty = 1): Promise<void> {
    const existing = await this.get(userId, itemKey);
    if (existing) {
      await this.items.update(
        { guild_id: this.guildId, user_id: userId, item_key: itemKey },
        { quantity: existing.quantity + qty },
      );
    } else {
      await this.items.insert({
        guild_id: this.guildId,
        user_id: userId,
        item_key: itemKey,
        quantity: qty,
      });
    }
  }

  async remove(userId: string, itemKey: string, qty = 1): Promise<boolean> {
    const existing = await this.get(userId, itemKey);
    if (!existing || existing.quantity < qty) return false;
    if (existing.quantity === qty) {
      await this.items.delete({ guild_id: this.guildId, user_id: userId, item_key: itemKey });
    } else {
      await this.items.update(
        { guild_id: this.guildId, user_id: userId, item_key: itemKey },
        { quantity: existing.quantity - qty },
      );
    }
    return true;
  }

  async transfer(fromId: string, toId: string, itemKey: string, qty = 1): Promise<boolean> {
    const ok = await this.remove(fromId, itemKey, qty);
    if (!ok) return false;
    await this.add(toId, itemKey, qty);
    return true;
  }
}
