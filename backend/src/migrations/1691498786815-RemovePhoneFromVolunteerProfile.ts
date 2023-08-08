import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePhoneFromVolunteerProfile1691498786815
  implements MigrationInterface
{
  name = 'RemovePhoneFromVolunteerProfile1691498786815';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "volunteer_profile" DROP COLUMN "phone"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "FK_4bd19cbbc18731c95e0fe5004bb" FOREIGN KEY ("template_id") REFERENCES "template"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract" DROP CONSTRAINT "FK_4bd19cbbc18731c95e0fe5004bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profile" ADD "phone" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "FK_4bd19cbbc18731c95e0fe5004bb" FOREIGN KEY ("template_id") REFERENCES "template"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
