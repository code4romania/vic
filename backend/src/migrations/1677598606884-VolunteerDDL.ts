import { MigrationInterface, QueryRunner } from 'typeorm';

export class VolunteerDDL1677598606884 implements MigrationInterface {
  name = 'VolunteerDDL1677598606884';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "volunteer_profile" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" text NOT NULL, "phone" text NOT NULL, "active_since" TIMESTAMP WITH TIME ZONE, "branch_id" uuid, "department_id" uuid, "role_id" uuid, CONSTRAINT "PK_33a3a098b211e5685669ae0647e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2883d29cdd484a57e6ce4a000d" ON "volunteer_profile" ("created_on") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."volunteer_status_enum" AS ENUM('active', 'archived', 'blocked')`,
    );
    await queryRunner.query(
      `CREATE TABLE "volunteer" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."volunteer_status_enum" NOT NULL DEFAULT 'active', "archived_on" TIMESTAMP WITH TIME ZONE, "blocked_on" TIMESTAMP WITH TIME ZONE, "volunteer_profile_id" uuid, "archived_by" uuid, "blocked_by" uuid, "user_id" uuid NOT NULL, "organization_id" uuid NOT NULL, CONSTRAINT "user_in_organization" UNIQUE ("user_id", "organization_id"), CONSTRAINT "REL_b5777dba16bb28fd163c1d3a0a" UNIQUE ("volunteer_profile_id"), CONSTRAINT "PK_76924da1998b3e07025e04c4d3c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_73bebfa1f3509d0aca033b257c" ON "volunteer" ("created_on") `,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profile" ADD CONSTRAINT "FK_4fbf3b509d48419c2951daf0278" FOREIGN KEY ("branch_id") REFERENCES "organization_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profile" ADD CONSTRAINT "FK_662788cdc80ca97f6b9ca2b5823" FOREIGN KEY ("department_id") REFERENCES "organization_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profile" ADD CONSTRAINT "FK_4feb7f4800b1c967943005c50ab" FOREIGN KEY ("role_id") REFERENCES "organization_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer" ADD CONSTRAINT "FK_b5777dba16bb28fd163c1d3a0a9" FOREIGN KEY ("volunteer_profile_id") REFERENCES "volunteer_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer" ADD CONSTRAINT "FK_88339f38f1c4bb34b088907952b" FOREIGN KEY ("archived_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer" ADD CONSTRAINT "FK_49fcee0630b1491316bb4b5ddc8" FOREIGN KEY ("blocked_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer" ADD CONSTRAINT "FK_7b29799c56753587e39cbd5cf8f" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer" ADD CONSTRAINT "FK_d568a9e88a1a9510312eb66d2dc" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "volunteer" DROP CONSTRAINT "FK_d568a9e88a1a9510312eb66d2dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer" DROP CONSTRAINT "FK_7b29799c56753587e39cbd5cf8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer" DROP CONSTRAINT "FK_49fcee0630b1491316bb4b5ddc8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer" DROP CONSTRAINT "FK_88339f38f1c4bb34b088907952b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer" DROP CONSTRAINT "FK_b5777dba16bb28fd163c1d3a0a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profile" DROP CONSTRAINT "FK_4feb7f4800b1c967943005c50ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profile" DROP CONSTRAINT "FK_662788cdc80ca97f6b9ca2b5823"`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profile" DROP CONSTRAINT "FK_4fbf3b509d48419c2951daf0278"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_73bebfa1f3509d0aca033b257c"`,
    );
    await queryRunner.query(`DROP TABLE "volunteer"`);
    await queryRunner.query(`DROP TYPE "public"."volunteer_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2883d29cdd484a57e6ce4a000d"`,
    );
    await queryRunner.query(`DROP TABLE "volunteer_profile"`);
  }
}
