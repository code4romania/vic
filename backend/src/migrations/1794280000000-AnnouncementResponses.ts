import { MigrationInterface, QueryRunner } from 'typeorm';

// VIC 2.0, issue #504: volunteers answer announcements from the app with a comment, once each.
export class AnnouncementResponses1794280000000 implements MigrationInterface {
  name = 'AnnouncementResponses1794280000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "announcement_response" (
        "deleted_on" TIMESTAMP WITH TIME ZONE,
        "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "comment" text NOT NULL,
        "announcement_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "volunteer_id" uuid,
        CONSTRAINT "UQ_announcement_response_user" UNIQUE ("announcement_id", "user_id"),
        CONSTRAINT "PK_announcement_response" PRIMARY KEY ("id"),
        CONSTRAINT "FK_announcement_response_announcement" FOREIGN KEY ("announcement_id") REFERENCES "announcement"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_announcement_response_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_announcement_response_volunteer" FOREIGN KEY ("volunteer_id") REFERENCES "volunteer"("id") ON DELETE SET NULL
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_announcement_response_created_on" ON "announcement_response" ("created_on")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "announcement_response"`);
  }
}
