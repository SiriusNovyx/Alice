import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateTempRolesTable1751644800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: "temp_roles",
        columns: [
          {
            name: "guild_id",
            type: "bigint",
            isPrimary: true,
          },
          {
            name: "user_id",
            type: "bigint",
            isPrimary: true,
          },
          {
            name: "role_id",
            type: "bigint",
            isPrimary: true,
          },
          {
            name: "mod_id",
            type: "bigint",
          },
          {
            name: "created_at",
            type: "datetime",
          },
          {
            name: "expires_at",
            type: "datetime",
          },
        ],
      }),
    );
    queryRunner.createIndex(
      "temp_roles",
      new TableIndex({
        columnNames: ["expires_at"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable("temp_roles");
  }
}
