import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActivityAreaToOrganization1684421976583
  implements MigrationInterface
{
  name = 'AddActivityAreaToOrganization1684421976583';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" ADD "activity_area" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN "activity_area"`,
    );
  }
}
