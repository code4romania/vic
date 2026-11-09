import { MigrationInterface, QueryRunner } from 'typeorm';

// VIC 2.0, issue #514: login with a magic link (web) or an emailed code (mobile); no passwords.
// - Every stored password hash is deleted, with the lockout columns that only guarded passwords.
// - pending_password becomes pending ("has never logged in"); active logins stay active.
// - Password reset tokens are deleted and their enum value becomes 'login'.
export class MagicLinkLogin1794200000000 implements MigrationInterface {
  name = 'MagicLinkLogin1794200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auth_identity" DROP COLUMN "password_hash"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_identity" DROP COLUMN "password_set_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_identity" DROP COLUMN "failed_attempts"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_identity" DROP COLUMN "locked_until"`,
    );

    await queryRunner.query(
      `ALTER TYPE "public"."auth_identity_status_enum" RENAME VALUE 'pending_password' TO 'pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_identity" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );

    await queryRunner.query(
      `DELETE FROM "auth_token" WHERE "type" = 'reset_password'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."auth_token_type_enum" RENAME VALUE 'reset_password' TO 'login'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // The deleted password hashes cannot come back: everyone would need a reset.
    await queryRunner.query(`DELETE FROM "auth_token" WHERE "type" = 'login'`);
    await queryRunner.query(
      `ALTER TYPE "public"."auth_token_type_enum" RENAME VALUE 'login' TO 'reset_password'`,
    );

    await queryRunner.query(
      `ALTER TYPE "public"."auth_identity_status_enum" RENAME VALUE 'pending' TO 'pending_password'`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_identity" ALTER COLUMN "status" SET DEFAULT 'pending_password'`,
    );

    await queryRunner.query(
      `ALTER TABLE "auth_identity" ADD "locked_until" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_identity" ADD "failed_attempts" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_identity" ADD "password_set_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_identity" ADD "password_hash" text`,
    );
  }
}
