import { MigrationInterface, QueryRunner } from 'typeorm';

// Login with NGO Hub (OIDC), issue 01: NGO Hub becomes one more identity provider, and an organization
// remembers which NGO Hub organization it is. The link is per environment: each one has a single
// NGOHUB_ISSUER, so a staging id never reaches a production database.
// Issue 03 adds the "it was not us" link (an auth token) and the two history events.
const EVENTS = ['NGOHUB_ADMIN_JOINED', 'NGOHUB_ADMIN_REVOKED'];

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
    await queryRunner.query(
      `ALTER TYPE "public"."auth_token_type_enum" ADD VALUE IF NOT EXISTS 'ngohub_revoke'`,
    );
    for (const event of EVENTS) {
      await queryRunner.query(
        `ALTER TYPE "public"."actions_archive_event_name_enum" ADD VALUE IF NOT EXISTS '${event}'`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "actions_archive" WHERE "event_name" IN (${EVENTS.map((event) => `'${event}'`).join(', ')})`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."actions_archive_event_name_enum" RENAME TO "actions_archive_event_name_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."actions_archive_event_name_enum" AS ENUM('UPDATE_ORGANIZATION_PROFILE', 'CREATE_ORGANIZATION_STRUCTURE', 'UPDATE_ORGANIZATION_STRUCTURE', 'DELETE_ORGANIZATION_STRUCTURE', 'APPROVE_ACCESS_REQUEST', 'REJECT_ACCESS_REQUEST', 'DELETE_ACCESS_REQUEST', 'CHANGE_VOLUNTEER_STATUS', 'UPDATE_VOLUNTEER_PROFILE', 'REGISTER_ACTIVITY_LOG', 'CHANGE_ACTIVITY_LOG_STATUS', 'CREATE_ACTIVITY_TYPE', 'UPDATE_ACTIVITY_TYPE', 'CHANGE_ACTIVITY_TYPE_STATUS', 'CREATE_EVENT', 'UPDATE_EVENT', 'DELETE_EVENT', 'CHANGE_EVENT_STATUS', 'CREATE_ANNOUNCEMENT', 'DELETE_ANNOUNCEMENT', 'PUBLISH_ANNOUNCEMENT', 'CREATE_CONTRACT', 'APPROVE_CONTRACT', 'REJECT_CONTRACT', 'DISABLE_ADMIN', 'ENABLE_ADMIN', 'DELETE_VOLUNTEER', 'UPDATE_ACTIVITY_LOG', 'CANCEL_ACTIVITY_LOG', 'UPDATE_ANNOUNCEMENT', 'CHANGE_ANNOUNCEMENT_STATUS', 'CREATE_ACCESS_CODE', 'UPDATE_ACCESS_CODE', 'DELETE_ACCESS_CODE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions_archive" ALTER COLUMN "event_name" TYPE "public"."actions_archive_event_name_enum" USING "event_name"::"text"::"public"."actions_archive_event_name_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."actions_archive_event_name_enum_old"`,
    );

    await queryRunner.query(
      `DELETE FROM "auth_token" WHERE "type" = 'ngohub_revoke'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."auth_token_type_enum" RENAME TO "auth_token_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."auth_token_type_enum" AS ENUM('verify_email', 'login', 'invite', 'sensitive_action', 'change_email')`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_token" ALTER COLUMN "type" TYPE "public"."auth_token_type_enum" USING "type"::"text"::"public"."auth_token_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."auth_token_type_enum_old"`);

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
