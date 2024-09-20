import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveVolunteerTutorData1726041710983
  implements MigrationInterface
{
  name = 'RemoveVolunteerTutorData1726041710983';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "document_contract" DROP COLUMN "volunteer_tutor_data"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "document_contract" ADD "volunteer_tutor_data" jsonb`,
    );
  }
}
