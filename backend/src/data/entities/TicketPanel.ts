import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("ticket_panels")
export class TicketPanel {
  @PrimaryColumn()
  guild_id: string;

  @PrimaryColumn()
  message_id: string;

  @Column()
  channel_id: string;

  @Column()
  created_at: string;
}
