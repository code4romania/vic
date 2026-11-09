import { MigrationInterface, QueryRunner } from 'typeorm';

// VIC 2.0, issue #490: certificates ("adeverințe") are stored next to contracts, with a type. The
// registration number of a certificate may repeat a contract number, so uniqueness includes the type.
export class DocumentType1794320000000 implements MigrationInterface {
  name = 'DocumentType1794320000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."contract_type_enum" AS ENUM('CONTRACT', 'CERTIFICATE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD "type" "public"."contract_type_enum" NOT NULL DEFAULT 'CONTRACT'`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" DROP CONSTRAINT "organization-contract-number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "organization-contract-number" UNIQUE ("contract_number", "organization_id", "type")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "contract" WHERE "type" = 'CERTIFICATE'`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" DROP CONSTRAINT "organization-contract-number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "organization-contract-number" UNIQUE ("contract_number", "organization_id")`,
    );
    await queryRunner.query(`ALTER TABLE "contract" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."contract_type_enum"`);
  }
}
