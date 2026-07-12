import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateGiveawaysTable1760000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: "giveaways",
        columns: [
          { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "guild_id", type: "bigint" },
          { name: "channel_id", type: "bigint" },
          { name: "message_id", type: "bigint" },
          { name: "host_id", type: "bigint" },
          { name: "prize", type: "text" },
          { name: "winner_count", type: "int" },
          { name: "ends_at", type: "datetime" },
          { name: "status", type: "varchar", length: "16" },
          { name: "entrants", type: "mediumtext" },
          { name: "required_role_ids", type: "text", isNullable: true },
          { name: "winners", type: "text", isNullable: true },
          { name: "created_at", type: "datetime" },
        ],
      }),
    );
    await queryRunner.createIndex(
      "giveaways",
      new TableIndex({ columnNames: ["guild_id", "message_id"], isUnique: true }),
    );
    await queryRunner.createIndex(
      "giveaways",
      new TableIndex({ columnNames: ["guild_id", "status", "ends_at"] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable("giveaways");
  }
}
