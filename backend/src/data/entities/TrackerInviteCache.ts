import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("tracker_invite_cache")
export class TrackerInviteCache {
  @PrimaryColumn()
  guild_id: string;

  @PrimaryColumn()
  code: string;

  @Column({ type: String, nullable: true })
  inviter_id: string | null;

  @Column({ type: "int", default: 0 })
  uses: number;
}
