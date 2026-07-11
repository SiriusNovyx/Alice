import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Scrypt API login hashes are stored as `s1:` + 128 hex chars (131 total).
 * The original dashboard_logins.token column was varchar(64) for SHA-256 hex.
 */
export class WidenApiLoginsTokenColumn1752249600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `api_logins` MODIFY `token` VARCHAR(255) NOT NULL COLLATE 'ascii_bin'",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `api_logins` MODIFY `token` VARCHAR(64) NOT NULL COLLATE 'ascii_bin'",
    );
  }
}
