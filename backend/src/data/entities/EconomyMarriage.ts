import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("economy_marriages")
export class EconomyMarriage {
  @PrimaryColumn()
  guild_id: string;

  @PrimaryColumn()
  user1_id: string;

  @PrimaryColumn()
  user2_id: string;

  @Column({ type: "datetime" })
  married_at: string;
}
