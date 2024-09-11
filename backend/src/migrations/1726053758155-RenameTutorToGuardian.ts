import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameTutorToGuardian1726053758155 implements MigrationInterface {
  name = 'RenameTutorToGuardian1726053758155';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "document_contract" DROP CONSTRAINT "FK_8586b2b6c023b4a93d301363004"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" RENAME COLUMN "tutor_signature_id" TO "legal_guardian_signature_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" ADD CONSTRAINT "FK_219866394581cf64cb2b7194b88" FOREIGN KEY ("legal_guardian_signature_id") REFERENCES "document_signature"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "document_contract" DROP CONSTRAINT "FK_219866394581cf64cb2b7194b88"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" RENAME COLUMN "legal_guardian_signature_id" TO "tutor_signature_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" ADD CONSTRAINT "FK_8586b2b6c023b4a93d301363004" FOREIGN KEY ("tutor_signature_id") REFERENCES "document_signature"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
