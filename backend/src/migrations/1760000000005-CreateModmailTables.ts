import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateModmailTables1760000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: "modmail_threads",
        columns: [
          { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "guild_id", type: "bigint" },
          { name: "channel_id", type: "bigint" },
          { name: "user_id", type: "bigint" },
          { name: "status", type: "varchar", length: "16" },
          { name: "created_at", type: "datetime" },
          { name: "closed_at", type: "datetime", isNullable: true },
        ],
      }),
    );
    await queryRunner.createIndex(
      "modmail_threads",
      new TableIndex({ columnNames: ["guild_id", "user_id", "status"] }),
    );
    await queryRunner.createIndex(
      "modmail_threads",
      new TableIndex({ columnNames: ["guild_id", "channel_id"] }),
    );

    await queryRunner.createTable(
      new Table({
        name: "modmail_blacklist",
        columns: [
          { name: "guild_id", type: "bigint", isPrimary: true },
          { name: "user_id", type: "bigint", isPrimary: true },
          { name: "created_at", type: "datetime" },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable("modmail_blacklist");
    await queryRunner.dropTable("modmail_threads");
  }
}
