import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("tracker_message_counts")
export class TrackerMessageCount {
  @PrimaryColumn()
  guild_id: string;

  @PrimaryColumn()
  user_id: string;

  @Column({ type: "int", default: 0 })
  count: number;
}
