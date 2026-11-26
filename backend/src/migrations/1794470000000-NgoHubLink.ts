import { MigrationInterface, QueryRunner } from 'typeorm';

// Login with NGO Hub (OIDC), issue 01: NGO Hub becomes one more identity provider, and an organization
// remembers which NGO Hub organization it is. The link is per environment: each one has a single
// NGOHUB_ISSUER, so a staging id never reaches a production database.
export class NgoHubLink1794470000000 implements MigrationInterface {
  name = 'NgoHubLink1794470000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."auth_identity_provider_provider_enum" ADD VALUE IF NOT EXISTS 'ngohub'`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ADD "ngohub_organization_id" integer`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "organization_ngohub_organization_id_unique" ON "organization" ("ngohub_organization_id") WHERE "ngohub_organization_id" IS NOT NULL AND "deleted_on" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."organization_ngohub_organization_id_unique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN "ngohub_organization_id"`,
    );
    await queryRunner.query(
      `DELETE FROM "auth_identity_provider" WHERE "provider" = 'ngohub'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."auth_identity_provider_provider_enum" RENAME TO "auth_identity_provider_provider_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."auth_identity_provider_provider_enum" AS ENUM('google', 'facebook', 'apple')`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_identity_provider" ALTER COLUMN "provider" TYPE "public"."auth_identity_provider_provider_enum" USING "provider"::"text"::"public"."auth_identity_provider_provider_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."auth_identity_provider_provider_enum_old"`,
    );
  }
}
