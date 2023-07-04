import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationsSettings1688471693304 implements MigrationInterface {
  name = 'NotificationsSettings1688471693304';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_settings_notifications_from_enum" AS ENUM('ALL_ORGANIZATIONS', 'MY_ORGANIZATIONS')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications_settings" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "notifications_from" "public"."notifications_settings_notifications_from_enum" NOT NULL DEFAULT 'MY_ORGANIZATIONS', "notifications_via_email" boolean NOT NULL DEFAULT true, "notifications_via_push" boolean NOT NULL DEFAULT false, "user_id" uuid NOT NULL, CONSTRAINT "REL_5471ee230b9746dfb775d6c354" UNIQUE ("user_id"), CONSTRAINT "PK_845fa2744fb6610e1158f9e8ef1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0e86e2ec0c2bd0344d57eae623" ON "notifications_settings" ("created_on") `,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications_settings" ADD CONSTRAINT "FK_5471ee230b9746dfb775d6c3540" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications_settings" DROP CONSTRAINT "FK_5471ee230b9746dfb775d6c3540"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0e86e2ec0c2bd0344d57eae623"`,
    );
    await queryRunner.query(`DROP TABLE "notifications_settings"`);
    await queryRunner.query(
      `DROP TYPE "public"."notifications_settings_notifications_from_enum"`,
    );
  }
}
