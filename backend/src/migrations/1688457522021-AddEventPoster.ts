import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEventPoster1688457522021 implements MigrationInterface {
  name = 'AddEventPoster1688457522021';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event" ADD "poster" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "poster"`);
  }
}
