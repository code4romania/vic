import { MigrationInterface, QueryRunner } from 'typeorm';

export class SavePosterPath1688458866696 implements MigrationInterface {
  name = 'SavePosterPath1688458866696';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event" ADD "poster_path" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "poster_path"`);
  }
}
