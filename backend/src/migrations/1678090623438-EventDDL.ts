import { MigrationInterface, QueryRunner } from 'typeorm';

export class EventDDL1678090623438 implements MigrationInterface {
  name = 'EventDDL1678090623438';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."event_status_enum" AS ENUM('draft', 'published', 'archived')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."event_attendance_type_enum" AS ENUM('simple', 'mention')`,
    );
    await queryRunner.query(
      `CREATE TABLE "event" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "description" text NOT NULL, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE, "location" text, "is_public" boolean NOT NULL DEFAULT 'false', "status" "public"."event_status_enum" NOT NULL DEFAULT 'published', "attendance_type" "public"."event_attendance_type_enum" NOT NULL DEFAULT 'simple', "attendance_mention" text, "observation" text, "organization_id" uuid NOT NULL, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0ccaecd3c8ac5ff63f2fbe62ff" ON "event" ("created_on") `,
    );
    await queryRunner.query(
      `CREATE TABLE "event_targets_organization_structure" ("eventId" uuid NOT NULL, "organizationStructureId" uuid NOT NULL, CONSTRAINT "PK_096c3647a99dca067a00b1d0d20" PRIMARY KEY ("eventId", "organizationStructureId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1268a2af69756aa3dc0bbb6e24" ON "event_targets_organization_structure" ("eventId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cae9cf43e2849c69cfe6c26eda" ON "event_targets_organization_structure" ("organizationStructureId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "event_tasks_activity_type" ("eventId" uuid NOT NULL, "activityTypeId" uuid NOT NULL, CONSTRAINT "PK_616cff93534084ddac8cc14a307" PRIMARY KEY ("eventId", "activityTypeId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_800f5cb83029245049d702fe58" ON "event_tasks_activity_type" ("eventId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f92615d803f0fae389ab94382a" ON "event_tasks_activity_type" ("activityTypeId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_f476008fe61c6e93f2fe8a3d124" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_targets_organization_structure" ADD CONSTRAINT "FK_1268a2af69756aa3dc0bbb6e244" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_targets_organization_structure" ADD CONSTRAINT "FK_cae9cf43e2849c69cfe6c26eda2" FOREIGN KEY ("organizationStructureId") REFERENCES "organization_structure"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_tasks_activity_type" ADD CONSTRAINT "FK_800f5cb83029245049d702fe58e" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_tasks_activity_type" ADD CONSTRAINT "FK_f92615d803f0fae389ab94382a2" FOREIGN KEY ("activityTypeId") REFERENCES "activity_type"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_tasks_activity_type" DROP CONSTRAINT "FK_f92615d803f0fae389ab94382a2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_tasks_activity_type" DROP CONSTRAINT "FK_800f5cb83029245049d702fe58e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_targets_organization_structure" DROP CONSTRAINT "FK_cae9cf43e2849c69cfe6c26eda2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_targets_organization_structure" DROP CONSTRAINT "FK_1268a2af69756aa3dc0bbb6e244"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_f476008fe61c6e93f2fe8a3d124"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f92615d803f0fae389ab94382a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_800f5cb83029245049d702fe58"`,
    );
    await queryRunner.query(`DROP TABLE "event_tasks_activity_type"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cae9cf43e2849c69cfe6c26eda"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1268a2af69756aa3dc0bbb6e24"`,
    );
    await queryRunner.query(
      `DROP TABLE "event_targets_organization_structure"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0ccaecd3c8ac5ff63f2fbe62ff"`,
    );
    await queryRunner.query(`DROP TABLE "event"`);
    await queryRunner.query(`DROP TYPE "public"."event_attendance_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."event_status_enum"`);
  }
}
