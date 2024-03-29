import { MigrationInterface, QueryRunner } from 'typeorm';

export class ActionsArchiveContractTargets1687957625046
  implements MigrationInterface
{
  name = 'ActionsArchiveContractTargets1687957625046';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."actions_archive_event_name_enum" RENAME TO "actions_archive_event_name_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."actions_archive_event_name_enum" AS ENUM('UPDATE_ORGANIZATION_PROFILE', 'CREATE_ORGANIZATION_STRUCTURE', 'UPDATE_ORGANIZATION_STRUCTURE', 'DELETE_ORGANIZATION_STRUCTURE', 'APPROVE_ACCESS_REQUEST', 'REJECT_ACCESS_REQUEST', 'DELETE_ACCESS_REQUEST', 'CHANGE_VOLUNTEER_STATUS', 'UPDATE_VOLUNTEER_PROFILE', 'REGISTER_ACTIVITY_LOG', 'CHANGE_ACTIVITY_LOG_STATUS', 'CREATE_ACTIVITY_TYPE', 'UPDATE_ACTIVITY_TYPE', 'CHANGE_ACTIVITY_TYPE_STATUS', 'CREATE_EVENT', 'UPDATE_EVENT', 'DELETE_EVENT', 'CHANGE_EVENT_STATUS', 'CREATE_ANNOUNCEMENT', 'DELETE_ANNOUNCEMENT', 'PUBLISH_ANNOUNCEMENT', 'CREATE_CONTRACT', 'APPROVE_CONTRACT', 'REJECT_CONTRACT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions_archive" ALTER COLUMN "event_name" TYPE "public"."actions_archive_event_name_enum" USING "event_name"::"text"::"public"."actions_archive_event_name_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."actions_archive_event_name_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."actions_archive_event_name_enum_old" AS ENUM('UPDATE_ORGANIZATION_PROFILE', 'CREATE_ORGANIZATION_STRUCTURE', 'UPDATE_ORGANIZATION_STRUCTURE', 'DELETE_ORGANIZATION_STRUCTURE', 'APPROVE_ACCESS_REQUEST', 'REJECT_ACCESS_REQUEST', 'DELETE_ACCESS_REQUEST', 'CHANGE_VOLUNTEER_STATUS', 'UPDATE_VOLUNTEER_PROFILE', 'REGISTER_ACTIVITY_LOG', 'CHANGE_ACTIVITY_LOG_STATUS', 'CREATE_ACTIVITY_TYPE', 'UPDATE_ACTIVITY_TYPE', 'CHANGE_ACTIVITY_TYPE_STATUS', 'CREATE_EVENT', 'UPDATE_EVENT', 'DELETE_EVENT', 'CHANGE_EVENT_STATUS', 'CREATE_ANNOUNCEMENT', 'DELETE_ANNOUNCEMENT', 'PUBLISH_ANNOUNCEMENT')`,
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
  }
}
