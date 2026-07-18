import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateBotProfileConfigsTable1760000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: "bot_profile_configs",
        columns: [
          { name: "guild_id", type: "bigint", isPrimary: true },
          { name: "nick", type: "varchar", length: "32", isNullable: true },
          { name: "avatar", type: "text", isNullable: true },
          { name: "banner", type: "text", isNullable: true },
          { name: "bio", type: "text", isNullable: true },
          { name: "updated_at", type: "datetime", isNullable: true },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable("bot_profile_configs");
  }
}
