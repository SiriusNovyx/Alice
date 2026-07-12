import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateVoiceMasterChannelsTable1760000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: "voice_master_channels",
        columns: [
          {
            name: "guild_id",
            type: "bigint",
            isPrimary: true,
          },
          {
            name: "channel_id",
            type: "bigint",
            isPrimary: true,
          },
          {
            name: "owner_id",
            type: "bigint",
          },
          {
            name: "created_at",
            type: "datetime",
          },
        ],
      }),
    );
    await queryRunner.createIndex(
      "voice_master_channels",
      new TableIndex({
        columnNames: ["guild_id", "owner_id"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable("voice_master_channels");
  }
}
