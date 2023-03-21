import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrganizationRelationToActivityLog1679403188166
  implements MigrationInterface
{
  name = 'AddOrganizationRelationToActivityLog1679403188166';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD "organization_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD CONSTRAINT "FK_eb6630f3f614e4cfec203d32ceb" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP CONSTRAINT "FK_eb6630f3f614e4cfec203d32ceb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP COLUMN "organization_id"`,
    );
  }
}
