import { MigrationInterface, QueryRunner } from 'typeorm';

export class ActivityLogActivityTypeOptional1680186021700
  implements MigrationInterface
{
  name = 'ActivityLogActivityTypeOptional1680186021700';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP CONSTRAINT "FK_da505416c600ebb88b518bfc3a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ALTER COLUMN "activity_type_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD CONSTRAINT "FK_da505416c600ebb88b518bfc3a0" FOREIGN KEY ("activity_type_id") REFERENCES "activity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP CONSTRAINT "FK_da505416c600ebb88b518bfc3a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ALTER COLUMN "activity_type_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD CONSTRAINT "FK_da505416c600ebb88b518bfc3a0" FOREIGN KEY ("activity_type_id") REFERENCES "activity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
