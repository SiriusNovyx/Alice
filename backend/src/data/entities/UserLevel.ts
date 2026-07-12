import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("user_levels")
export class UserLevel {
  @PrimaryColumn()
  guild_id: string;

  @PrimaryColumn()
  user_id: string;

  @Column({ type: "int", default: 0 })
  xp: number;

  @Column({ type: "int", default: 0 })
  level: number;

  @Column({ type: "int", default: 0 })
  total_xp: number;

  @Column({ type: "datetime", nullable: true })
  last_message_at: string | null;
}
