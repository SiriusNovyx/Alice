import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("tracker_blacklisted_channels")
export class TrackerBlacklistedChannel {
  @PrimaryColumn()
  guild_id: string;

  @PrimaryColumn()
  channel_id: string;

  @Column()
  created_at: string;
}
