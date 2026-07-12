import { Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository.js";
import { dataSource } from "./dataSource.js";
import { TicketPanel } from "./entities/TicketPanel.js";

export class GuildTicketPanels extends BaseGuildRepository {
  private panels: Repository<TicketPanel>;

  constructor(guildId: string) {
    super(guildId);
    this.panels = dataSource.getRepository(TicketPanel);
  }

  async create(channelId: string, messageId: string, createdAt: string): Promise<void> {
    await this.panels.insert({
      guild_id: this.guildId,
      channel_id: channelId,
      message_id: messageId,
      created_at: createdAt,
    });
  }

  findByMessageId(messageId: string): Promise<TicketPanel | null> {
    return this.panels.findOne({ where: { guild_id: this.guildId, message_id: messageId } });
  }
}
