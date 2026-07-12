import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("modmail_threads")
export class ModmailThread {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  guild_id: string;

  @Column()
  channel_id: string;

  @Column()
  user_id: string;

  @Column()
  status: string;

  @Column()
  created_at: string;

  @Column({ type: "datetime", nullable: true })
  closed_at: string | null;
}
