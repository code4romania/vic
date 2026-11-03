import { MigrationInterface, QueryRunner } from 'typeorm';

export class OwnAuthTables1793360611355 implements MigrationInterface {
  name = 'OwnAuthTables1793360611355';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "cognito-userType-email-unique"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."auth_identity_realm_enum" AS ENUM('web', 'mobile')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."auth_identity_status_enum" AS ENUM('pending_password', 'active', 'disabled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "auth_identity" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "realm" "public"."auth_identity_realm_enum" NOT NULL, "email" text NOT NULL, "password_hash" text, "status" "public"."auth_identity_status_enum" NOT NULL DEFAULT 'pending_password', "super_admin" boolean NOT NULL DEFAULT false, "email_verified_at" TIMESTAMP WITH TIME ZONE, "password_set_at" TIMESTAMP WITH TIME ZONE, "last_login_at" TIMESTAMP WITH TIME ZONE, "failed_attempts" integer NOT NULL DEFAULT '0', "locked_until" TIMESTAMP WITH TIME ZONE, "legacy_cognito_username" text, "user_id" uuid, CONSTRAINT "PK_3eeca3f18e671626194e553eb89" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_81ccec86bf2d75c2a2989040cd" ON "auth_identity" ("created_on") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "auth_identity_realm_email_unique" ON "auth_identity" ("realm", "email") WHERE "deleted_on" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."auth_token_type_enum" AS ENUM('verify_email', 'reset_password', 'invite')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."auth_token_form_enum" AS ENUM('link', 'code')`,
    );
    await queryRunner.query(
      `CREATE TABLE "auth_token" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "identity_id" uuid NOT NULL, "type" "public"."auth_token_type_enum" NOT NULL, "form" "public"."auth_token_form_enum" NOT NULL, "token_hash" text NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used_at" TIMESTAMP WITH TIME ZONE, "replaced_at" TIMESTAMP WITH TIME ZONE, "attempts" integer NOT NULL DEFAULT '0', "sent_to" text, "sent_by" uuid, CONSTRAINT "UQ_bf636362c6d210728e4539630ba" UNIQUE ("token_hash"), CONSTRAINT "PK_4572ff5d1264c4a523f01aa86a0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_56128a0e7f1e9ec6cfc4804bb8" ON "auth_token" ("created_on") `,
    );
    await queryRunner.query(
      `CREATE INDEX "auth_token_live_identity_type" ON "auth_token" ("identity_id", "type") WHERE "used_at" IS NULL AND "replaced_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_token" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "identity_id" uuid NOT NULL, "token_hash" text NOT NULL, "previous_hash" text, "rotated_at" TIMESTAMP WITH TIME ZONE, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE, "last_used_at" TIMESTAMP WITH TIME ZONE, "user_agent" text, "ip" text, CONSTRAINT "UQ_f0812282fad2e352cdaf83ef0a9" UNIQUE ("token_hash"), CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e9c295c6c4c3a652d6bebca105" ON "refresh_token" ("created_on") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f42e03c38b07bb8ec60998226b" ON "refresh_token" ("identity_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1c065b6d7955b6696f220f9940" ON "refresh_token" ("previous_hash") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."auth_identity_provider_provider_enum" AS ENUM('google', 'facebook', 'apple')`,
    );
    await queryRunner.query(
      `CREATE TABLE "auth_identity_provider" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "identity_id" uuid NOT NULL, "provider" "public"."auth_identity_provider_provider_enum" NOT NULL, "subject" text NOT NULL, "email_at_link" text, CONSTRAINT "auth_identity_provider_provider_subject_unique" UNIQUE ("provider", "subject"), CONSTRAINT "PK_8964a50b470c0c0d8dca794b3e4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4a5d3b1af58eeaa76663aa0c69" ON "auth_identity_provider" ("created_on") `,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ADD "status" character varying NOT NULL DEFAULT 'active'`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ADD "validated_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ADD "validated_by" uuid`,
    );
    await queryRunner.query(`ALTER TABLE "organization" ADD "tax_id" text`);
    await queryRunner.query(`ALTER TABLE "organization" ADD "website" text`);
    await queryRunner.query(
      `ALTER TABLE "organization" ADD "statute_url" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ADD "suspended_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "cognito_id" DROP NOT NULL`,
    );
    // Fails on duplicate emails per type ignoring case: run scripts/auth-preflight.sql first.
    await queryRunner.query(
      `CREATE UNIQUE INDEX "user_type_email_unique" ON "user" ("type", lower("email")) WHERE "deleted_on" IS NULL`,
    );
    // R7: admin events for the Team page. down() rebuilds the enum without them.
    await queryRunner.query(
      `ALTER TYPE "public"."actions_archive_event_name_enum" ADD VALUE 'DISABLE_ADMIN'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."actions_archive_event_name_enum" ADD VALUE 'ENABLE_ADMIN'`,
    );
    // Every NGO that exists before own auth was approved in NGO Hub: active and validated.
    await queryRunner.query(
      `UPDATE "organization" SET "status" = 'active', "validated_at" = now()`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "organization_tax_id_unique" ON "organization" ("tax_id") WHERE "tax_id" IS NOT NULL AND "deleted_on" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ADD CONSTRAINT "FK_d7438160181bac5b7f1df3851bc" FOREIGN KEY ("validated_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_identity" ADD CONSTRAINT "FK_4f02c3f95fd60470b55ee10e2a3" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_token" ADD CONSTRAINT "FK_39228fb204e7fde85fe8c457644" FOREIGN KEY ("identity_id") REFERENCES "auth_identity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_token" ADD CONSTRAINT "FK_0e3e2b91a620eaf760b5077e7a1" FOREIGN KEY ("sent_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_f42e03c38b07bb8ec60998226bd" FOREIGN KEY ("identity_id") REFERENCES "auth_identity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_identity_provider" ADD CONSTRAINT "FK_2712ca8fe8946a8bcc9348f1c1b" FOREIGN KEY ("identity_id") REFERENCES "auth_identity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auth_identity_provider" DROP CONSTRAINT "FK_2712ca8fe8946a8bcc9348f1c1b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_f42e03c38b07bb8ec60998226bd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_token" DROP CONSTRAINT "FK_0e3e2b91a620eaf760b5077e7a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_token" DROP CONSTRAINT "FK_39228fb204e7fde85fe8c457644"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_identity" DROP CONSTRAINT "FK_4f02c3f95fd60470b55ee10e2a3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" DROP CONSTRAINT "FK_d7438160181bac5b7f1df3851bc"`,
    );
    await queryRunner.query(`DROP INDEX "public"."organization_tax_id_unique"`);
    await queryRunner.query(
      `CREATE TYPE "public"."actions_archive_event_name_enum_old" AS ENUM('UPDATE_ORGANIZATION_PROFILE', 'CREATE_ORGANIZATION_STRUCTURE', 'UPDATE_ORGANIZATION_STRUCTURE', 'DELETE_ORGANIZATION_STRUCTURE', 'APPROVE_ACCESS_REQUEST', 'REJECT_ACCESS_REQUEST', 'DELETE_ACCESS_REQUEST', 'CHANGE_VOLUNTEER_STATUS', 'UPDATE_VOLUNTEER_PROFILE', 'REGISTER_ACTIVITY_LOG', 'CHANGE_ACTIVITY_LOG_STATUS', 'CREATE_ACTIVITY_TYPE', 'UPDATE_ACTIVITY_TYPE', 'CHANGE_ACTIVITY_TYPE_STATUS', 'CREATE_EVENT', 'UPDATE_EVENT', 'DELETE_EVENT', 'CHANGE_EVENT_STATUS', 'CREATE_ANNOUNCEMENT', 'DELETE_ANNOUNCEMENT', 'PUBLISH_ANNOUNCEMENT', 'CREATE_CONTRACT', 'APPROVE_CONTRACT', 'REJECT_CONTRACT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions_archive" ALTER COLUMN "event_name" TYPE "public"."actions_archive_event_name_enum_old" USING "event_name"::"text"::"public"."actions_archive_event_name_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."actions_archive_event_name_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."actions_archive_event_name_enum_old" RENAME TO "actions_archive_event_name_enum"`,
    );
    await queryRunner.query(`DROP INDEX "public"."user_type_email_unique"`);
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "cognito_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN "suspended_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN "statute_url"`,
    );
    await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "website"`);
    await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "tax_id"`);
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN "validated_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN "validated_at"`,
    );
    await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "status"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4a5d3b1af58eeaa76663aa0c69"`,
    );
    await queryRunner.query(`DROP TABLE "auth_identity_provider"`);
    await queryRunner.query(
      `DROP TYPE "public"."auth_identity_provider_provider_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1c065b6d7955b6696f220f9940"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f42e03c38b07bb8ec60998226b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e9c295c6c4c3a652d6bebca105"`,
    );
    await queryRunner.query(`DROP TABLE "refresh_token"`);
    await queryRunner.query(
      `DROP INDEX "public"."auth_token_live_identity_type"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_56128a0e7f1e9ec6cfc4804bb8"`,
    );
    await queryRunner.query(`DROP TABLE "auth_token"`);
    await queryRunner.query(`DROP TYPE "public"."auth_token_form_enum"`);
    await queryRunner.query(`DROP TYPE "public"."auth_token_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."auth_identity_realm_email_unique"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_81ccec86bf2d75c2a2989040cd"`,
    );
    await queryRunner.query(`DROP TABLE "auth_identity"`);
    await queryRunner.query(`DROP TYPE "public"."auth_identity_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."auth_identity_realm_enum"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "cognito-userType-email-unique" UNIQUE ("cognito_id", "type", "email")`,
    );
  }
}
