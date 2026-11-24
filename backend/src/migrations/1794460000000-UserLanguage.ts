import { MigrationInterface, QueryRunner } from 'typeorm';

// The language of a person's apps, push notifications and emails: 'ro', 'en' or null (not chosen yet).
// People who already used VIC stay on Romanian until they change it themselves: anyone from before the
// new login (cognito_id) and anyone who has logged in since (an active auth_identity). A Candidate
// (has_account = false) and an invited login that was never used stay null.
export class UserLanguage1794460000000 implements MigrationInterface {
  name = 'UserLanguage1794460000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "language" character varying(2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "user_language_check" CHECK ("language" IN ('ro', 'en'))`,
    );
    await queryRunner.query(
      `UPDATE "user" u SET "language" = 'ro'
       WHERE u."has_account" = true
         AND (
           u."cognito_id" IS NOT NULL
           OR EXISTS (
             SELECT 1 FROM "auth_identity" i
             WHERE i."user_id" = u."id" AND i."status" = 'active' AND i."deleted_on" IS NULL
           )
         )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "user_language_check"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "language"`);
  }
}
