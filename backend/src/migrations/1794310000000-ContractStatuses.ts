import { MigrationInterface, QueryRunner } from 'typeorm';

// VIC 2.0, issue #488: contracts are Active (signed) or Inactive (pending or expired); "Expirat" and
// "Expiră în curând" are computed from the end date. Contracts are uploaded already signed (#486), so
// the end date becomes optional (no end date: never expires) and so does the contract number.
// APPROVED -> ACTIVE; PENDING_VOLUNTEER, PENDING_ADMIN and REJECTED -> INACTIVE.
export class ContractStatuses1794310000000 implements MigrationInterface {
  name = 'ContractStatuses1794310000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."contract_status_enum_v2" AS ENUM('ACTIVE', 'INACTIVE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ALTER COLUMN "status" TYPE "public"."contract_status_enum_v2"
         USING (CASE WHEN "status"::text = 'APPROVED' THEN 'ACTIVE' ELSE 'INACTIVE' END)::"public"."contract_status_enum_v2"`,
    );
    await queryRunner.query(`DROP TYPE "public"."contract_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."contract_status_enum_v2" RENAME TO "contract_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ALTER COLUMN "end_date" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ALTER COLUMN "contract_number" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "contract" SET "contract_number" = left("id"::text, 9) WHERE "contract_number" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ALTER COLUMN "contract_number" SET NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "contract" SET "end_date" = "start_date" + interval '1 year' WHERE "end_date" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ALTER COLUMN "end_date" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contract_status_enum_old" AS ENUM('PENDING_VOLUNTEER', 'PENDING_ADMIN', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ALTER COLUMN "status" TYPE "public"."contract_status_enum_old"
         USING (CASE WHEN "status"::text = 'ACTIVE' THEN 'APPROVED' ELSE 'PENDING_VOLUNTEER' END)::"public"."contract_status_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."contract_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."contract_status_enum_old" RENAME TO "contract_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ALTER COLUMN "status" SET DEFAULT 'PENDING_VOLUNTEER'`,
    );
  }
}
