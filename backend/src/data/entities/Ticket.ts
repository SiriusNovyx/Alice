import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("tickets")
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  guild_id: string;

  @Column()
  channel_id: string;

  @Column()
  opener_id: string;

  @Column({ type: "bigint", nullable: true })
  claimed_by: string | null;

  @Column()
  category_key: string;

  @Column()
  status: string;

  @Column()
  created_at: string;

  @Column({ type: "datetime", nullable: true })
  closed_at: string | null;

  @Column({ type: "text", nullable: true })
  close_reason: string | null;
}
