import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropUserRelationFromNotificationSetting1688553496670
  implements MigrationInterface
{
  name = 'DropUserRelationFromNotificationSetting1688553496670';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications_settings" DROP CONSTRAINT "REL_5471ee230b9746dfb775d6c354"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications_settings" DROP COLUMN "user_id"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications_settings" ADD "user_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications_settings" ADD CONSTRAINT "REL_5471ee230b9746dfb775d6c354" UNIQUE ("user_id")`,
    );
  }
}
