import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserEmailTypeUnique1684135710464 implements MigrationInterface {
  name = 'UserEmailTypeUnique1684135710464';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_24f393ce6efc331a76831ffc814"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_8e1f623798118e629b46a9e6299"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "cognito-userType-email-unique" UNIQUE ("cognito_id", "type", "email")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "cognito-userType-email-unique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_8e1f623798118e629b46a9e6299" UNIQUE ("phone")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_24f393ce6efc331a76831ffc814" UNIQUE ("cognito_id")`,
    );
  }
}
