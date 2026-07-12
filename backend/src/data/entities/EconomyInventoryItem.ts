import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("economy_inventory")
export class EconomyInventoryItem {
  @PrimaryColumn()
  guild_id: string;

  @PrimaryColumn()
  user_id: string;

  @PrimaryColumn()
  item_id: string;

  @Column({ type: "int", default: 1 })
  quantity: number;
}
