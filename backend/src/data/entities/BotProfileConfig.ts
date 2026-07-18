import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("bot_profile_configs")
export class BotProfileConfig {
  @PrimaryColumn()
  guild_id: string;

  @Column({ type: "varchar", length: "32", nullable: true })
  nick: string | null;

  @Column({ type: "text", nullable: true })
  avatar: string | null;

  @Column({ type: "text", nullable: true })
  banner: string | null;

  @Column({ type: "text", nullable: true })
  bio: string | null;

  @Column({ type: "datetime", nullable: true })
  updated_at: string | null;
}
