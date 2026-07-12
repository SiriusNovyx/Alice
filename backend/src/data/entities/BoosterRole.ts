import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("booster_roles")
export class BoosterRole {
  @PrimaryColumn()
  guild_id: string;

  @PrimaryColumn()
  user_id: string;

  @Column()
  role_id: string;

  @Column()
  created_at: string;
}
