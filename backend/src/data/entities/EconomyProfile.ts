import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("economy_profiles")
export class EconomyProfile {
  @PrimaryColumn()
  guild_id: string;

  @PrimaryColumn()
  user_id: string;

  @Column({ type: "bigint", default: 0 })
  cash: string;

  @Column({ type: "bigint", default: 0 })
  bank: string;

  @Column({ type: "bigint", default: 0 })
  gems: string;

  @Column({ type: "bigint", default: 100000 })
  bank_limit: string;

  @Column({ type: "varchar", length: "20", nullable: true })
  married_to: string | null;

  @Column({ type: "varchar", length: "36", nullable: true })
  clan_id: string | null;

  @Column({ type: "datetime", nullable: true })
  rob_protection_until: string | null;

  @Column({ type: "datetime", nullable: true })
  last_work: string | null;

  @Column({ type: "datetime", nullable: true })
  last_crime: string | null;

  @Column({ type: "datetime", nullable: true })
  last_daily: string | null;

  @Column({ type: "datetime", nullable: true })
  last_weekly: string | null;

  @Column({ type: "datetime", nullable: true })
  last_hunt: string | null;

  @Column({ type: "datetime", nullable: true })
  last_battle: string | null;

  @Column({ type: "datetime", nullable: true })
  last_beg: string | null;

  @Column({ type: "datetime", nullable: true })
  last_rob: string | null;

  @Column({ type: "datetime", nullable: true })
  last_slots: string | null;
}
