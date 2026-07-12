import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class ExpandEconomyTables1760000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const hasColumn = async (table: string, column: string): Promise<boolean> => {
      const rows: Array<{ cnt: number }> = await queryRunner.query(
        `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [table, column],
      );
      return Number(rows[0]?.cnt) > 0;
    };

    const hasTable = async (table: string): Promise<boolean> => {
      const rows: Array<{ cnt: number }> = await queryRunner.query(
        `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
        [table],
      );
      return Number(rows[0]?.cnt) > 0;
    };

    if (!(await hasColumn("economy_profiles", "gems"))) {
      await queryRunner.query(`
        ALTER TABLE economy_profiles
          ADD COLUMN gems BIGINT NOT NULL DEFAULT 0,
          ADD COLUMN bank_limit BIGINT NOT NULL DEFAULT 100000,
          ADD COLUMN married_to VARCHAR(20) NULL,
          ADD COLUMN clan_id VARCHAR(36) NULL,
          ADD COLUMN rob_protection_until DATETIME NULL,
          ADD COLUMN last_weekly DATETIME NULL,
          ADD COLUMN last_hunt DATETIME NULL,
          ADD COLUMN last_battle DATETIME NULL,
          ADD COLUMN last_beg DATETIME NULL,
          ADD COLUMN last_rob DATETIME NULL,
          ADD COLUMN last_slots DATETIME NULL
      `);
    }

    if (!(await hasTable("economy_inventory"))) {
      await queryRunner.createTable(
        new Table({
          name: "economy_inventory",
          columns: [
            { name: "guild_id", type: "bigint", isPrimary: true },
            { name: "user_id", type: "bigint", isPrimary: true },
            { name: "item_id", type: "varchar", length: "64", isPrimary: true },
            { name: "quantity", type: "int", default: 1 },
          ],
        }),
      );
    }

    if (!(await hasTable("economy_creatures"))) {
      await queryRunner.createTable(
        new Table({
          name: "economy_creatures",
          columns: [
            { name: "id", type: "varchar", length: "36", isPrimary: true },
            { name: "guild_id", type: "bigint" },
            { name: "user_id", type: "bigint" },
            { name: "creature_key", type: "varchar", length: "64" },
            { name: "name", type: "varchar", length: "64" },
            { name: "rarity", type: "varchar", length: "16" },
            { name: "hp", type: "int", default: 50 },
            { name: "attack", type: "int", default: 10 },
            { name: "defense", type: "int", default: 10 },
            { name: "speed", type: "int", default: 10 },
            { name: "is_team", type: "boolean", default: false },
            { name: "caught_at", type: "datetime" },
          ],
        }),
      );
      await queryRunner.createIndex(
        "economy_creatures",
        new TableIndex({ columnNames: ["guild_id", "user_id"] }),
      );
    }

    if (!(await hasTable("economy_clans"))) {
      await queryRunner.createTable(
        new Table({
          name: "economy_clans",
          columns: [
            { name: "id", type: "varchar", length: "36", isPrimary: true },
            { name: "guild_id", type: "bigint" },
            { name: "name", type: "varchar", length: "32" },
            { name: "tag", type: "varchar", length: "5" },
            { name: "owner_id", type: "bigint" },
            { name: "bank", type: "bigint", default: 0 },
            { name: "level", type: "int", default: 1 },
            { name: "created_at", type: "datetime" },
          ],
        }),
      );
      await queryRunner.createIndex(
        "economy_clans",
        new TableIndex({ columnNames: ["guild_id", "name"], isUnique: true }),
      );
    }

    // TypeORM emits DEFAULT <value> literally; string literals must include quotes: "'member'"
    if (!(await hasTable("economy_clan_members"))) {
      await queryRunner.createTable(
        new Table({
          name: "economy_clan_members",
          columns: [
            { name: "guild_id", type: "bigint", isPrimary: true },
            { name: "clan_id", type: "varchar", length: "36", isPrimary: true },
            { name: "user_id", type: "bigint", isPrimary: true },
            { name: "role", type: "varchar", length: "16", default: "'member'" },
            { name: "joined_at", type: "datetime" },
          ],
        }),
      );
    }

    if (!(await hasTable("economy_marriages"))) {
      await queryRunner.createTable(
        new Table({
          name: "economy_marriages",
          columns: [
            { name: "guild_id", type: "bigint", isPrimary: true },
            { name: "user1_id", type: "bigint", isPrimary: true },
            { name: "user2_id", type: "bigint", isPrimary: true },
            { name: "married_at", type: "datetime" },
          ],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable("economy_marriages");
    await queryRunner.dropTable("economy_clan_members");
    await queryRunner.dropTable("economy_clans");
    await queryRunner.dropTable("economy_creatures");
    await queryRunner.dropTable("economy_inventory");
    await queryRunner.query(`
      ALTER TABLE economy_profiles
        DROP COLUMN gems,
        DROP COLUMN bank_limit,
        DROP COLUMN married_to,
        DROP COLUMN clan_id,
        DROP COLUMN rob_protection_until,
        DROP COLUMN last_weekly,
        DROP COLUMN last_hunt,
        DROP COLUMN last_battle,
        DROP COLUMN last_beg,
        DROP COLUMN last_rob,
        DROP COLUMN last_slots
    `);
  }
}
