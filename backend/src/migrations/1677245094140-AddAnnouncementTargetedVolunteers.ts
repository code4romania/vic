import { MigrationInterface, QueryRunner } from 'typeorm';

export class AnnouncementTargetedVolunteers1677245094140
  implements MigrationInterface
{
  name = 'AnnouncementTargetedVolunteers1677245094140';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD "targeted_volunteers" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcement" DROP COLUMN "targeted_volunteers"`,
    );
  }
}
