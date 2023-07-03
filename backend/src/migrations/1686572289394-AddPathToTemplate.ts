import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPathToTemplate1686572289394 implements MigrationInterface {
  name = 'AddPathToTemplate1686572289394';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "template" ADD "path" text NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "template" DROP COLUMN "path"`);
  }
}
