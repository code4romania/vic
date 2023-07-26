import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveEventPosterPath1690377269161 implements MigrationInterface {
  name = 'RemoveEventPosterPath1690377269161';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "poster_path"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event" ADD "poster_path" text`);
  }
}
