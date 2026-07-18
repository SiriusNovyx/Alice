import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateTrackerTables1760000000009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: "tracker_message_counts",
        columns: [
          { name: "guild_id", type: "bigint", isPrimary: true },
          { name: "user_id", type: "bigint", isPrimary: true },
          { name: "count", type: "int", default: 0 },
        ],
      }),
    );
    await queryRunner.createIndex(
      "tracker_message_counts",
      new TableIndex({ columnNames: ["guild_id", "count"] }),
    );

    await queryRunner.createTable(
      new Table({
        name: "tracker_daily_message_counts",
        columns: [
          { name: "guild_id", type: "bigint", isPrimary: true },
          { name: "user_id", type: "bigint", isPrimary: true },
          { name: "date", type: "varchar", length: "10", isPrimary: true },
          { name: "count", type: "int", default: 0 },
        ],
      }),
    );
    await queryRunner.createIndex(
      "tracker_daily_message_counts",
      new TableIndex({ columnNames: ["guild_id", "date"] }),
    );

    await queryRunner.createTable(
      new Table({
        name: "tracker_blacklisted_channels",
        columns: [
          { name: "guild_id", type: "bigint", isPrimary: true },
          { name: "channel_id", type: "bigint", isPrimary: true },
          { name: "created_at", type: "datetime" },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "tracker_invites",
        columns: [
          { name: "guild_id", type: "bigint", isPrimary: true },
          { name: "invited_id", type: "bigint", isPrimary: true },
          { name: "inviter_id", type: "bigint" },
          { name: "joined_at", type: "datetime" },
          { name: "fake", type: "boolean", default: false },
          { name: "has_left", type: "boolean", default: false },
        ],
      }),
    );
    await queryRunner.createIndex(
      "tracker_invites",
      new TableIndex({ columnNames: ["guild_id", "inviter_id"] }),
    );

    await queryRunner.createTable(
      new Table({
        name: "tracker_invite_cache",
        columns: [
          { name: "guild_id", type: "bigint", isPrimary: true },
          { name: "code", type: "varchar", length: "64", isPrimary: true },
          { name: "inviter_id", type: "bigint", isNullable: true },
          { name: "uses", type: "int", default: 0 },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable("tracker_invite_cache");
    await queryRunner.dropTable("tracker_invites");
    await queryRunner.dropTable("tracker_blacklisted_channels");
    await queryRunner.dropTable("tracker_daily_message_counts");
    await queryRunner.dropTable("tracker_message_counts");
  }
}
