import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRejectionReasonInContract1727072817374
  implements MigrationInterface
{
  name = 'AddRejectionReasonInContract1727072817374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "document_contract" ADD "rejected_by_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" ADD "rejection_reason" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" ADD "rejection_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" ADD CONSTRAINT "FK_cec86e3e8a9abc28312b5476f87" FOREIGN KEY ("rejected_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "document_contract" DROP CONSTRAINT "FK_cec86e3e8a9abc28312b5476f87"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" DROP COLUMN "rejection_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" DROP COLUMN "rejection_reason"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" DROP COLUMN "rejected_by_id"`,
    );
  }
}
