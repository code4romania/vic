import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocationToRegularUser1676995640148
  implements MigrationInterface
{
  name = 'AddLocationToRegularUser1676995640148';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "location_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_37bfb01591406f0fefaed6799a0" FOREIGN KEY ("location_id") REFERENCES "_city"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_37bfb01591406f0fefaed6799a0"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "location_id"`);
  }
}
