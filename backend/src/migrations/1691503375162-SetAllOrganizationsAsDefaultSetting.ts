import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetAllOrganizationsAsDefaultSetting1691503375162
  implements MigrationInterface
{
  name = 'SetAllOrganizationsAsDefaultSetting1691503375162';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications_settings" ALTER COLUMN "notifications_from" SET DEFAULT 'ALL_ORGANIZATIONS'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications_settings" ALTER COLUMN "notifications_from" SET DEFAULT 'MY_ORGANIZATIONS'`,
    );
  }
}
