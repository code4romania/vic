import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPersonalDataAndTutor1725953984933
  implements MigrationInterface
{
  name = 'AddUserPersonalDataAndTutor1725953984933';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_personal_data" ADD "cnp" text`);
    await queryRunner.query(
      `ALTER TABLE "user_personal_data" ADD "identity_document_issued_by" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_personal_data" ADD "legal_guardian" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_personal_data" DROP CONSTRAINT "UQ_a43393c324223214daef1914850"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_personal_data" ADD CONSTRAINT "UQ_a43393c324223214daef1914850" UNIQUE ("identity_document_number")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_personal_data" DROP COLUMN "legal_guardian"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_personal_data" DROP COLUMN "issued_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_personal_data" DROP COLUMN "cnp"`,
    );
  }
}
