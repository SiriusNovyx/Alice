import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("giveaways")
export class Giveaway {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  guild_id: string;

  @Column()
  channel_id: string;

  @Column()
  message_id: string;

  @Column()
  host_id: string;

  @Column({ type: "text" })
  prize: string;

  @Column({ type: "int" })
  winner_count: number;

  @Column()
  ends_at: string;

  @Column()
  status: string;

  @Column({ type: "text" })
  entrants: string;

  @Column({ type: "text", nullable: true })
  required_role_ids: string | null;

  @Column({ type: "text", nullable: true })
  winners: string | null;

  @Column()
  created_at: string;
}
