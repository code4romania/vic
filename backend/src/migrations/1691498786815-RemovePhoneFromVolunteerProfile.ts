import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePhoneFromVolunteerProfile1691498786815
  implements MigrationInterface
{
  name = 'RemovePhoneFromVolunteerProfile1691498786815';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "volunteer_profile" DROP COLUMN "phone"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "volunteer_profile" ADD "phone" text NOT NULL`,
    );
  }
}
