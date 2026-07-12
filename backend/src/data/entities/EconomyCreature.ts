import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("economy_creatures")
export class EconomyCreature {
  @PrimaryColumn({ type: "varchar", length: "36" })
  id: string;

  @Column()
  guild_id: string;

  @Column()
  user_id: string;

  @Column({ type: "varchar", length: "64" })
  creature_key: string;

  @Column({ type: "varchar", length: "64" })
  name: string;

  @Column({ type: "varchar", length: "16" })
  rarity: string;

  @Column({ type: "int", default: 50 })
  hp: number;

  @Column({ type: "int", default: 10 })
  attack: number;

  @Column({ type: "int", default: 10 })
  defense: number;

  @Column({ type: "int", default: 10 })
  speed: number;

  @Column({ type: "boolean", default: false })
  is_team: boolean;

  @Column({ type: "datetime" })
  caught_at: string;
}
