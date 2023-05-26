import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUniqueContraintOnSeries1685098784836
  implements MigrationInterface
{
  name = 'RemoveUniqueContraintOnSeries1685098784836';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_personal_data" DROP CONSTRAINT "UQ_dc8908edcc104d4b012d923e980"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_personal_data" ADD CONSTRAINT "UQ_dc8908edcc104d4b012d923e980" UNIQUE ("identity_document_series")`,
    );
  }
}
