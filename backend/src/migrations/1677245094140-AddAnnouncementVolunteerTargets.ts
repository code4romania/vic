import { MigrationInterface, QueryRunner } from 'typeorm';

export class AnnouncementVolunteerTargets1677245094140
  implements MigrationInterface
{
  name = 'AnnouncementVolunteerTargets1677245094140';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD "volunteer_targets" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcement" DROP COLUMN "volunteer_targets"`,
    );
  }
}
