import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("collection_inventory")
export class CollectionItem {
  @PrimaryColumn()
  guild_id: string;

  @PrimaryColumn()
  user_id: string;

  @PrimaryColumn()
  item_key: string;

  @Column({ type: "int", default: 1 })
  quantity: number;
}
