import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrganizationNewFields1725349961532
  implements MigrationInterface
{
  name = 'AddOrganizationNewFields1725349961532';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization" ADD "cui" text`);
    await queryRunner.query(
      `ALTER TABLE "organization" ADD "legal_representative_full_name" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ADD "legal_representative_role" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN "legal_representative_role"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN "legal_representative_full_name"`,
    );
    await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "cui"`);
  }
}
