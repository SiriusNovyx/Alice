import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("economy_clans")
export class EconomyClan {
  @PrimaryColumn({ type: "varchar", length: "36" })
  id: string;

  @Column()
  guild_id: string;

  @Column({ type: "varchar", length: "32" })
  name: string;

  @Column({ type: "varchar", length: "5" })
  tag: string;

  @Column()
  owner_id: string;

  @Column({ type: "bigint", default: 0 })
  bank: string;

  @Column({ type: "int", default: 1 })
  level: number;

  @Column({ type: "datetime" })
  created_at: string;
}
