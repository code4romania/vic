import { MigrationInterface, QueryRunner } from 'typeorm';

export class OptionalOrganizationAddress1686663138959
  implements MigrationInterface
{
  name = 'OptionalOrganizationAddress1686663138959';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" ALTER COLUMN "address" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" ALTER COLUMN "address" SET NOT NULL`,
    );
  }
}
