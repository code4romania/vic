import { MigrationInterface, QueryRunner } from 'typeorm';

export class ActivityType1677066203589 implements MigrationInterface {
  name = 'ActivityType1677066203589';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."activity_type_status_enum" AS ENUM('active', 'archived')`,
    );
    await queryRunner.query(
      `CREATE TABLE "activity_type" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "icon" text NOT NULL, "status" "public"."activity_type_status_enum" NOT NULL DEFAULT 'active', "branch_id" uuid, "department_id" uuid, "role_id" uuid, "organization_id" uuid, CONSTRAINT "name_organization" UNIQUE ("name", "organization_id"), CONSTRAINT "PK_fc087d79002cef578e27dd9fdab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1a509aea459399650d7b5f29e2" ON "activity_type" ("created_on") `,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" ADD CONSTRAINT "FK_a0e14b26bf646dc2298dd620f4f" FOREIGN KEY ("branch_id") REFERENCES "organization_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" ADD CONSTRAINT "FK_fbc413d412c8d588b9f124c860e" FOREIGN KEY ("department_id") REFERENCES "organization_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" ADD CONSTRAINT "FK_0eb7496834e307dabdb3065910b" FOREIGN KEY ("role_id") REFERENCES "organization_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" ADD CONSTRAINT "FK_780343b632ab25cd9dcfb95c133" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_type" DROP CONSTRAINT "FK_780343b632ab25cd9dcfb95c133"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" DROP CONSTRAINT "FK_0eb7496834e307dabdb3065910b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" DROP CONSTRAINT "FK_fbc413d412c8d588b9f124c860e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" DROP CONSTRAINT "FK_a0e14b26bf646dc2298dd620f4f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1a509aea459399650d7b5f29e2"`,
    );
    await queryRunner.query(`DROP TABLE "activity_type"`);
    await queryRunner.query(`DROP TYPE "public"."activity_type_status_enum"`);
  }
}
