import { MigrationInterface, QueryRunner } from 'typeorm';

export class ActionArchive1680273483984 implements MigrationInterface {
  name = 'ActionArchive1680273483984';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."actions_archive_event_name_enum" AS ENUM('UPDATE_ORGANIZATION_PROFILE', 'CREATE_ORGANIZATION_STRUCTURE', 'UPDATE_ORGANIZATION_STRUCTURE', 'DELETE_ORGANIZATION_STRUCTURE', 'APPROVE_ACCESS_REQUEST', 'REJECT_ACCESS_REQUEST', 'DELETE_ACCESS_REQUEST', 'CHANGE_VOLUNTEER_STATUS', 'UPDATE_VOLUNTEER_PROFILE', 'REGISTER_ACTIVITY_LOG', 'CHANGE_ACTIVITY_LOG_STATUS', 'CREATE_ACTIVITY_TYPE', 'UPDATE_ACTIVITY_TYPE', 'CHANGE_ACTIVITY_TYPE_STATUS', 'CREATE_EVENT', 'UPDATE_EVENT', 'DELETE_EVENT', 'CHANGE_EVENT_STATUS', 'CREATE_ANNOUNCEMENT', 'DELETE_ANNOUNCEMENT', 'PUBLISH_ANNOUNCEMENT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "actions_archive" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "event_name" "public"."actions_archive_event_name_enum" NOT NULL, "event_data" jsonb NOT NULL, "changes" jsonb, "author_id" uuid NOT NULL, CONSTRAINT "PK_7416942d580603aacdb0cb43623" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5c796f2ae080cd25834d386926" ON "actions_archive" ("created_on") `,
    );
    await queryRunner.query(
      `ALTER TABLE "actions_archive" ADD CONSTRAINT "FK_993779d3f08188ef935408fc3f9" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "actions_archive" DROP CONSTRAINT "FK_993779d3f08188ef935408fc3f9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5c796f2ae080cd25834d386926"`,
    );
    await queryRunner.query(`DROP TABLE "actions_archive"`);
    await queryRunner.query(
      `DROP TYPE "public"."actions_archive_event_name_enum"`,
    );
  }
}
