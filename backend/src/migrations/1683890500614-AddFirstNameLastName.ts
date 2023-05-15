import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFirstNameLastName1683890500614 implements MigrationInterface {
  name = 'AddFirstNameLastName1683890500614';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "first_name" text`);
    await queryRunner.query(`ALTER TABLE "user" ADD "last_name" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_name"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "first_name"`);
  }
}
