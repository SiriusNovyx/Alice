import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("economy_clan_members")
export class EconomyClanMember {
  @PrimaryColumn()
  guild_id: string;

  @PrimaryColumn()
  clan_id: string;

  @PrimaryColumn()
  user_id: string;

  @Column({ type: "varchar", length: "16", default: "member" })
  role: string;

  @Column({ type: "datetime" })
  joined_at: string;
}
