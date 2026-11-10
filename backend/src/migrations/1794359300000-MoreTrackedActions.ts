import { MigrationInterface, QueryRunner } from 'typeorm';

const ADDED = [
  'UPDATE_ACTIVITY_LOG',
  'CANCEL_ACTIVITY_LOG',
  'UPDATE_ANNOUNCEMENT',
  'CHANGE_ANNOUNCEMENT_STATUS',
  'CREATE_ACCESS_CODE',
  'UPDATE_ACCESS_CODE',
  'DELETE_ACCESS_CODE',
];

// VIC 2.0, issue #593: the actions history also logs announcement edits and status changes, access codes,
// and hours the volunteer edits or deletes.
export class MoreTrackedActions1794359300000 implements MigrationInterface {
  name = 'MoreTrackedActions1794359300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const value of ADDED) {
      await queryRunner.query(
        `ALTER TYPE "public"."actions_archive_event_name_enum" ADD VALUE IF NOT EXISTS '${value}'`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "actions_archive" WHERE "event_name" IN (${ADDED.map(
        (value) => `'${value}'`,
      ).join(', ')})`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."actions_archive_event_name_enum" RENAME TO "actions_archive_event_name_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."actions_archive_event_name_enum" AS ENUM('UPDATE_ORGANIZATION_PROFILE', 'CREATE_ORGANIZATION_STRUCTURE', 'UPDATE_ORGANIZATION_STRUCTURE', 'DELETE_ORGANIZATION_STRUCTURE', 'APPROVE_ACCESS_REQUEST', 'REJECT_ACCESS_REQUEST', 'DELETE_ACCESS_REQUEST', 'CHANGE_VOLUNTEER_STATUS', 'UPDATE_VOLUNTEER_PROFILE', 'REGISTER_ACTIVITY_LOG', 'CHANGE_ACTIVITY_LOG_STATUS', 'CREATE_ACTIVITY_TYPE', 'UPDATE_ACTIVITY_TYPE', 'CHANGE_ACTIVITY_TYPE_STATUS', 'CREATE_EVENT', 'UPDATE_EVENT', 'DELETE_EVENT', 'CHANGE_EVENT_STATUS', 'CREATE_ANNOUNCEMENT', 'DELETE_ANNOUNCEMENT', 'PUBLISH_ANNOUNCEMENT', 'CREATE_CONTRACT', 'APPROVE_CONTRACT', 'REJECT_CONTRACT', 'DISABLE_ADMIN', 'ENABLE_ADMIN', 'DELETE_VOLUNTEER')`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions_archive" ALTER COLUMN "event_name" TYPE "public"."actions_archive_event_name_enum" USING "event_name"::"text"::"public"."actions_archive_event_name_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."actions_archive_event_name_enum_old"`,
    );
  }
}
