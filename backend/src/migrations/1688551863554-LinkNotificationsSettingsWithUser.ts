import { MigrationInterface, QueryRunner } from 'typeorm';

export class LinkNotificationsSettingsWithUser1688551863554
  implements MigrationInterface
{
  name = 'LinkNotificationsSettingsWithUser1688551863554';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "notifications_settings_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_7ac96a21d6ec649dcd82965a0e2" UNIQUE ("notifications_settings_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_7ac96a21d6ec649dcd82965a0e2" FOREIGN KEY ("notifications_settings_id") REFERENCES "notifications_settings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_7ac96a21d6ec649dcd82965a0e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_7ac96a21d6ec649dcd82965a0e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "notifications_settings_id"`,
    );
  }
}
