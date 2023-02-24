import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrganizationStructureType1677167014969
  implements MigrationInterface
{
  name = 'UpdateOrganizationStructureType1677167014969';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_structure" DROP CONSTRAINT "organization-name-type"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."organization_structure_type_enum" RENAME TO "organization_structure_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organization_structure_type_enum" AS ENUM('branch', 'department', 'role')`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_structure" ALTER COLUMN "type" TYPE "public"."organization_structure_type_enum" USING "type"::"text"::"public"."organization_structure_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."organization_structure_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_structure" ADD CONSTRAINT "organization-name-type" UNIQUE ("name", "organization_id", "type")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_structure" DROP CONSTRAINT "organization-name-type"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organization_structure_type_enum_old" AS ENUM('Branch', 'Department', 'Role')`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_structure" ALTER COLUMN "type" TYPE "public"."organization_structure_type_enum_old" USING "type"::"text"::"public"."organization_structure_type_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."organization_structure_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."organization_structure_type_enum_old" RENAME TO "organization_structure_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_structure" ADD CONSTRAINT "organization-name-type" UNIQUE ("name", "type", "organization_id")`,
    );
  }
}
