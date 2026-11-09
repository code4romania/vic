import { MigrationInterface, QueryRunner } from 'typeorm';

// VIC 2.0, issue #492: events lose the banner (poster), the linked activities (tasks),
// the internal notes (observation) and the registration type (simple / with mention),
// and get a capacity. Mentions already given on RSVPs (event_rsvp.mention) are kept.
// Banner files stay in S3; see the PR for the clean-up.
export class SimplifyEvents1794250000000 implements MigrationInterface {
  name = 'SimplifyEvents1794250000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "event_tasks_activity_type"`);
    await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "poster"`);
    await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "observation"`);
    await queryRunner.query(
      `ALTER TABLE "event" DROP COLUMN "attendance_mention"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" DROP COLUMN "attendance_type"`,
    );
    await queryRunner.query(`DROP TYPE "public"."event_attendance_type_enum"`);
    await queryRunner.query(`ALTER TABLE "event" ADD "capacity" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Only the structure comes back; the dropped values are gone.
    await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "capacity"`);
    await queryRunner.query(
      `CREATE TYPE "public"."event_attendance_type_enum" AS ENUM('simple', 'mention')`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD "attendance_type" "public"."event_attendance_type_enum" NOT NULL DEFAULT 'simple'`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD "attendance_mention" text`,
    );
    await queryRunner.query(`ALTER TABLE "event" ADD "observation" text`);
    await queryRunner.query(`ALTER TABLE "event" ADD "poster" text`);
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
      `ALTER TABLE "event_tasks_activity_type" ADD CONSTRAINT "FK_800f5cb83029245049d702fe58e" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_tasks_activity_type" ADD CONSTRAINT "FK_f92615d803f0fae389ab94382a2" FOREIGN KEY ("activityTypeId") REFERENCES "activity_type"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
