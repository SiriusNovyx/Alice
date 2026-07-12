import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateUserLevelsTable1760000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: "user_levels",
        columns: [
          { name: "guild_id", type: "bigint", isPrimary: true },
          { name: "user_id", type: "bigint", isPrimary: true },
          { name: "xp", type: "int", default: 0 },
          { name: "level", type: "int", default: 0 },
          { name: "total_xp", type: "int", default: 0 },
          { name: "last_message_at", type: "datetime", isNullable: true },
        ],
      }),
    );
    await queryRunner.createIndex(
      "user_levels",
      new TableIndex({
        columnNames: ["guild_id", "xp"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable("user_levels");
  }
}
