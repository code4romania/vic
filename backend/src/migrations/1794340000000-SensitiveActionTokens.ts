import { MigrationInterface, QueryRunner } from 'typeorm';

// VIC 2.0, issue #508: emailed codes before sensitive actions, and the code that confirms a new email.
export class SensitiveActionTokens1794340000000 implements MigrationInterface {
  name = 'SensitiveActionTokens1794340000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."auth_token_type_enum" ADD VALUE IF NOT EXISTS 'sensitive_action'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."auth_token_type_enum" ADD VALUE IF NOT EXISTS 'change_email'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "auth_token" WHERE "type" IN ('sensitive_action', 'change_email')`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."auth_token_type_enum" RENAME TO "auth_token_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."auth_token_type_enum" AS ENUM('verify_email', 'login', 'invite')`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_token" ALTER COLUMN "type" TYPE "public"."auth_token_type_enum" USING "type"::"text"::"public"."auth_token_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."auth_token_type_enum_old"`);
  }
}
