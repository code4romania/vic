import { MigrationInterface, QueryRunner } from 'typeorm';

export class AccessRequests1676909493693 implements MigrationInterface {
  name = 'AccessRequests1676909493693';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "access_request" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" text NOT NULL DEFAULT 'pending', "rejection_reason" text, "answers" jsonb NOT NULL, "updated_by" uuid, "requested_by" uuid NOT NULL, "organization_id" uuid, CONSTRAINT "PK_a543250cab0b6d2eb3a85593d93" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0746787e4a6431a9221190b3b0" ON "access_request" ("created_on") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_24f393ce6efc331a76831ffc814" UNIQUE ("cognito_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "access_request" ADD CONSTRAINT "FK_25c5a145370d822d1aaa8539523" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "access_request" ADD CONSTRAINT "FK_4aa1cd3d3779addab2c48ee5b04" FOREIGN KEY ("requested_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "access_request" ADD CONSTRAINT "FK_ecc48c0d09a106391d5bcfb4a67" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "access_request" DROP CONSTRAINT "FK_ecc48c0d09a106391d5bcfb4a67"`,
    );
    await queryRunner.query(
      `ALTER TABLE "access_request" DROP CONSTRAINT "FK_4aa1cd3d3779addab2c48ee5b04"`,
    );
    await queryRunner.query(
      `ALTER TABLE "access_request" DROP CONSTRAINT "FK_25c5a145370d822d1aaa8539523"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_24f393ce6efc331a76831ffc814"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0746787e4a6431a9221190b3b0"`,
    );
    await queryRunner.query(`DROP TABLE "access_request"`);
  }
}
