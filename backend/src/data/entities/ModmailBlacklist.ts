import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("modmail_blacklist")
export class ModmailBlacklist {
  @PrimaryColumn()
  guild_id: string;

  @PrimaryColumn()
  user_id: string;

  @Column()
  created_at: string;
}
