import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateEconomyCollectionBoosterTables1760000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: "economy_profiles",
        columns: [
          { name: "guild_id", type: "bigint", isPrimary: true },
          { name: "user_id", type: "bigint", isPrimary: true },
          { name: "cash", type: "bigint", default: 0 },
          { name: "bank", type: "bigint", default: 0 },
          { name: "last_work", type: "datetime", isNullable: true },
          { name: "last_crime", type: "datetime", isNullable: true },
          { name: "last_daily", type: "datetime", isNullable: true },
        ],
      }),
    );
    await queryRunner.createIndex(
      "economy_profiles",
      new TableIndex({ columnNames: ["guild_id", "cash"] }),
    );

    await queryRunner.createTable(
      new Table({
        name: "collection_inventory",
        columns: [
          { name: "guild_id", type: "bigint", isPrimary: true },
          { name: "user_id", type: "bigint", isPrimary: true },
          { name: "item_key", type: "varchar", length: "64", isPrimary: true },
          { name: "quantity", type: "int", default: 1 },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "booster_roles",
        columns: [
          { name: "guild_id", type: "bigint", isPrimary: true },
          { name: "user_id", type: "bigint", isPrimary: true },
          { name: "role_id", type: "bigint" },
          { name: "created_at", type: "datetime" },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable("booster_roles");
    await queryRunner.dropTable("collection_inventory");
    await queryRunner.dropTable("economy_profiles");
  }
}
