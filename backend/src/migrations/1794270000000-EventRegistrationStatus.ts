import { MigrationInterface, QueryRunner } from 'typeorm';

// VIC 2.0, issue #501: a "going" answer to an event becomes a registration the NGO approves or rejects
// (with a reason), and can change its decision. Existing "going" answers count as approved.
export class EventRegistrationStatus1794270000000
  implements MigrationInterface
{
  name = 'EventRegistrationStatus1794270000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."event_rsvp_status_enum" AS ENUM('pending', 'approved', 'rejected')`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_rsvp" ADD "status" "public"."event_rsvp_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_rsvp" ADD "rejection_reason" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_rsvp" ADD "decided_on" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "event_rsvp" ADD "decided_by" uuid`);
    await queryRunner.query(
      `ALTER TABLE "event_rsvp" ADD CONSTRAINT "FK_event_rsvp_decided_by" FOREIGN KEY ("decided_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `UPDATE "event_rsvp" SET "status" = 'approved' WHERE "going" = true`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_event_rsvp_status" ON "event_rsvp" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_event_rsvp_status"`);
    await queryRunner.query(
      `ALTER TABLE "event_rsvp" DROP CONSTRAINT "FK_event_rsvp_decided_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_rsvp" DROP COLUMN "decided_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_rsvp" DROP COLUMN "decided_on"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_rsvp" DROP COLUMN "rejection_reason"`,
    );
    await queryRunner.query(`ALTER TABLE "event_rsvp" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."event_rsvp_status_enum"`);
  }
}
