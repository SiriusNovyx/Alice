import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("temp_roles")
export class TempRole {
  @Column()
  @PrimaryColumn()
  guild_id: string;

  @Column()
  @PrimaryColumn()
  user_id: string;

  @Column()
  @PrimaryColumn()
  role_id: string;

  @Column() mod_id: string;

  @Column() created_at: string;

  @Column() expires_at: string;
}
