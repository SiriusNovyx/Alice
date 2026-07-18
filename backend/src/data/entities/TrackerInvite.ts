import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("tracker_invites")
export class TrackerInvite {
  @PrimaryColumn()
  guild_id: string;

  @PrimaryColumn()
  invited_id: string;

  @Column()
  inviter_id: string;

  @Column()
  joined_at: string;

  @Column({ type: "boolean", default: false })
  fake: boolean;

  @Column({ type: "boolean", default: false })
  has_left: boolean;
}
