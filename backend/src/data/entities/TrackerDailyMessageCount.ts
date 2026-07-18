import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("tracker_daily_message_counts")
export class TrackerDailyMessageCount {
  @PrimaryColumn()
  guild_id: string;

  @PrimaryColumn()
  user_id: string;

  /** UTC date as YYYY-MM-DD */
  @PrimaryColumn()
  date: string;

  @Column({ type: "int", default: 0 })
  count: number;
}
