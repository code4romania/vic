import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1721119397821 implements MigrationInterface {
  name = 'ChangeActivityLogDatetimeToDate1721119397821';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_log" ALTER COLUMN date TYPE DATE USING date::DATE;`,
    );
  }

  public async down(): Promise<void> {
    // Nothing we can do
  }
}
