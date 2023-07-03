import { MigrationInterface, QueryRunner } from 'typeorm';

export class UniqueContractNumber1687333190744 implements MigrationInterface {
  name = 'UniqueContractNumber1687333190744';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "organization-contract-number" UNIQUE ("contract_number", "organization_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract" DROP CONSTRAINT "organization-contract-number"`,
    );
  }
}
