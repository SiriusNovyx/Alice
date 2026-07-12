import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateTicketsTables1760000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: "tickets",
        columns: [
          { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "guild_id", type: "bigint" },
          { name: "channel_id", type: "bigint" },
          { name: "opener_id", type: "bigint" },
          { name: "claimed_by", type: "bigint", isNullable: true },
          { name: "category_key", type: "varchar", length: "64" },
          { name: "status", type: "varchar", length: "16" },
          { name: "created_at", type: "datetime" },
          { name: "closed_at", type: "datetime", isNullable: true },
          { name: "close_reason", type: "text", isNullable: true },
        ],
      }),
    );
    await queryRunner.createIndex(
      "tickets",
      new TableIndex({ columnNames: ["guild_id", "channel_id"] }),
    );
    await queryRunner.createIndex(
      "tickets",
      new TableIndex({ columnNames: ["guild_id", "opener_id", "status"] }),
    );

    await queryRunner.createTable(
      new Table({
        name: "ticket_panels",
        columns: [
          { name: "guild_id", type: "bigint", isPrimary: true },
          { name: "message_id", type: "bigint", isPrimary: true },
          { name: "channel_id", type: "bigint" },
          { name: "created_at", type: "datetime" },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable("ticket_panels");
    await queryRunner.dropTable("tickets");
  }
}
