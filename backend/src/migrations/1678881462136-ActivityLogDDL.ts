import { MigrationInterface, QueryRunner } from 'typeorm';

export class ActivityLogDDL1678881462136 implements MigrationInterface {
  name = 'ActivityLogDDL1678881462136';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."activity_log_status_enum" AS ENUM('pending', 'approved', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TABLE "activity_log" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" TIMESTAMP WITH TIME ZONE NOT NULL, "hours" integer NOT NULL, "mentions" text, "status" "public"."activity_log_status_enum" NOT NULL DEFAULT 'pending', "created_by_admin_id" uuid, "approved_on" TIMESTAMP WITH TIME ZONE, "approved_by" uuid, "rejection_reason" text, "rejected_on" TIMESTAMP WITH TIME ZONE, "rejected_by" uuid, "volunteer_id" uuid NOT NULL, "event_id" uuid, "activity_type_id" uuid NOT NULL, CONSTRAINT "PK_067d761e2956b77b14e534fd6f1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e37435b18a65fae46d399ed3f4" ON "activity_log" ("created_on") `,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD CONSTRAINT "FK_23b9e4ab85f3557fc90432afe41" FOREIGN KEY ("created_by_admin_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD CONSTRAINT "FK_7b6b0d4353367ef64adeb290729" FOREIGN KEY ("approved_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD CONSTRAINT "FK_eb107d5408f6f5cc59993864a57" FOREIGN KEY ("rejected_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD CONSTRAINT "FK_2649ea1f315cd12697474c575ab" FOREIGN KEY ("volunteer_id") REFERENCES "volunteer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD CONSTRAINT "FK_a784585252fedabf4d7af0a295f" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD CONSTRAINT "FK_da505416c600ebb88b518bfc3a0" FOREIGN KEY ("activity_type_id") REFERENCES "activity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP CONSTRAINT "FK_da505416c600ebb88b518bfc3a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP CONSTRAINT "FK_a784585252fedabf4d7af0a295f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP CONSTRAINT "FK_2649ea1f315cd12697474c575ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP CONSTRAINT "FK_eb107d5408f6f5cc59993864a57"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP CONSTRAINT "FK_7b6b0d4353367ef64adeb290729"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP CONSTRAINT "FK_23b9e4ab85f3557fc90432afe41"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e37435b18a65fae46d399ed3f4"`,
    );
    await queryRunner.query(`DROP TABLE "activity_log"`);
    await queryRunner.query(`DROP TYPE "public"."activity_log_status_enum"`);
  }
}
