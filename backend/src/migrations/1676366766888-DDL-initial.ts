import { MigrationInterface, QueryRunner } from 'typeorm';

export class DDL_INITIAL_1676366766888 implements MigrationInterface {
  name = 'DDL_INITIAL_1676366766888';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "organization" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "email" text NOT NULL, "phone" text NOT NULL, "address" text NOT NULL, "description" text, "logo" text, CONSTRAINT "UQ_c21e615583a3ebbb0977452afb0" UNIQUE ("name"), CONSTRAINT "UQ_5d06de67ef6ab02cbd938988bb1" UNIQUE ("email"), CONSTRAINT "UQ_d11ed6c5ea801c6eda5bb7aee15" UNIQUE ("phone"), CONSTRAINT "PK_472c1f99a32def1b0abb219cd67" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_763748c108da399095b7ee5fcf" ON "organization" ("created_on") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cognito_id" text NOT NULL, "name" text NOT NULL, "email" text NOT NULL, "phone" text NOT NULL, "organization_id" uuid, "birthday" TIMESTAMP WITH TIME ZONE, "sex" character varying, "profile_picture" text, "type" character varying NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_8e1f623798118e629b46a9e6299" UNIQUE ("phone"), CONSTRAINT "REL_3e103cdf85b7d6cb620b4db0f0" UNIQUE ("organization_id"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_773293fdd33ab67c6be087d6be" ON "user" ("created_on") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_31ef2b4d30675d0c15056b7f6e" ON "user" ("type") `,
    );
    await queryRunner.query(
      `CREATE TABLE "access_code" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" text NOT NULL, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE, "usage_count" integer NOT NULL DEFAULT '0', "created_by" uuid NOT NULL, "organization_id" uuid, CONSTRAINT "codeOrg" UNIQUE ("code", "organization_id"), CONSTRAINT "PK_31c26435c0d26a2ce6bee4a763b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_be9e2722a05a52b6ea7179126a" ON "access_code" ("created_on") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organization_structure_type_enum" AS ENUM('Branch', 'Department', 'Role')`,
    );
    await queryRunner.query(
      `CREATE TABLE "organization_structure" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "type" "public"."organization_structure_type_enum" NOT NULL, "created_by" uuid NOT NULL, "organization_id" uuid NOT NULL, CONSTRAINT "organization-name-type" UNIQUE ("name", "organization_id", "type"), CONSTRAINT "PK_08b0fa917ee2b4dd78fe3cf11d5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fc221c7b17d0bb6eef84e640a7" ON "organization_structure" ("created_on") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_3e103cdf85b7d6cb620b4db0f0c" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "access_code" ADD CONSTRAINT "FK_dabe225352269e406cf0d714c4f" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "access_code" ADD CONSTRAINT "FK_4fa62b3d4b38ce7af2fdc92d254" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_structure" ADD CONSTRAINT "FK_31696b8a0875fed983b5fea64ab" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_structure" ADD CONSTRAINT "FK_88742b7ef897e1774b1bc5d2085" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_structure" DROP CONSTRAINT "FK_88742b7ef897e1774b1bc5d2085"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_structure" DROP CONSTRAINT "FK_31696b8a0875fed983b5fea64ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "access_code" DROP CONSTRAINT "FK_4fa62b3d4b38ce7af2fdc92d254"`,
    );
    await queryRunner.query(
      `ALTER TABLE "access_code" DROP CONSTRAINT "FK_dabe225352269e406cf0d714c4f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_3e103cdf85b7d6cb620b4db0f0c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fc221c7b17d0bb6eef84e640a7"`,
    );
    await queryRunner.query(`DROP TABLE "organization_structure"`);
    await queryRunner.query(
      `DROP TYPE "public"."organization_structure_type_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_be9e2722a05a52b6ea7179126a"`,
    );
    await queryRunner.query(`DROP TABLE "access_code"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_31ef2b4d30675d0c15056b7f6e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_773293fdd33ab67c6be087d6be"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_763748c108da399095b7ee5fcf"`,
    );
    await queryRunner.query(`DROP TABLE "organization"`);
  }
}
