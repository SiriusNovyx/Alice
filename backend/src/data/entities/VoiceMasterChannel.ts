import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("voice_master_channels")
export class VoiceMasterChannel {
  @PrimaryColumn()
  guild_id: string;

  @PrimaryColumn()
  channel_id: string;

  @Column()
  owner_id: string;

  @Column()
  created_at: string;
}
