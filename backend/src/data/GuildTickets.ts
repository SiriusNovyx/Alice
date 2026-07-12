import { Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository.js";
import { dataSource } from "./dataSource.js";
import { Ticket } from "./entities/Ticket.js";

export class GuildTickets extends BaseGuildRepository {
  private tickets: Repository<Ticket>;

  constructor(guildId: string) {
    super(guildId);
    this.tickets = dataSource.getRepository(Ticket);
  }

  findByChannelId(channelId: string): Promise<Ticket | null> {
    return this.tickets.findOne({ where: { guild_id: this.guildId, channel_id: channelId } });
  }

  findOpenByOpener(openerId: string): Promise<Ticket | null> {
    return this.tickets.findOne({
      where: { guild_id: this.guildId, opener_id: openerId, status: "open" },
    });
  }

  countOpenByOpener(openerId: string): Promise<number> {
    return this.tickets.count({
      where: { guild_id: this.guildId, opener_id: openerId, status: "open" },
    });
  }

  async create(data: {
    channel_id: string;
    opener_id: string;
    category_key: string;
    created_at: string;
  }): Promise<Ticket> {
    const result = await this.tickets.insert({
      guild_id: this.guildId,
      claimed_by: null,
      status: "open",
      closed_at: null,
      close_reason: null,
      ...data,
    });
    return (await this.tickets.findOne({ where: { id: result.identifiers[0].id } }))!;
  }

  async claim(channelId: string, staffId: string): Promise<void> {
    await this.tickets.update(
      { guild_id: this.guildId, channel_id: channelId, status: "open" },
      { claimed_by: staffId },
    );
  }

  async close(channelId: string, closedAt: string, reason: string | null): Promise<void> {
    await this.tickets.update(
      { guild_id: this.guildId, channel_id: channelId },
      { status: "closed", closed_at: closedAt, close_reason: reason },
    );
  }
}
