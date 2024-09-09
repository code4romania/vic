import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeTimestampToDateForUser1725889826591
  implements MigrationInterface
{
  name = 'ChangeTimestampToDateForUser1725889826591';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_personal_data" ALTER COLUMN "identity_document_issue_date" TYPE date USING ("identity_document_issue_date"::timestamp AT TIME ZONE 'GMT+3')::date`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_personal_data" ALTER COLUMN "identity_document_expiration_date" TYPE date USING ("identity_document_expiration_date"::timestamp AT TIME ZONE 'GMT+3')::date`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "birthday" TYPE date USING ("birthday"::timestamp AT TIME ZONE 'GMT+3')::date`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "birthday"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "birthday" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_personal_data" DROP COLUMN "identity_document_expiration_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_personal_data" ADD "identity_document_expiration_date" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_personal_data" DROP COLUMN "identity_document_issue_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_personal_data" ADD "identity_document_issue_date" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
  }
}
