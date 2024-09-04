import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1725454854964 implements MigrationInterface {
  name = 'Migrations1725454854964';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "documents_template" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "organization_data" jsonb NOT NULL, "document_terms" text NOT NULL, "organization_id" uuid NOT NULL, "created_by_admin_id" uuid, CONSTRAINT "PK_3c3bacd617c899c37223ebbb037" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f745fb393b076c4c503437291b" ON "documents_template" ("created_on") `,
    );
    await queryRunner.query(
      `ALTER TABLE "documents_template" ADD CONSTRAINT "FK_0f3775a66466a4be5293db71421" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents_template" ADD CONSTRAINT "FK_b879124283b91c84eb3de436a81" FOREIGN KEY ("created_by_admin_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "documents_template" DROP CONSTRAINT "FK_b879124283b91c84eb3de436a81"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents_template" DROP CONSTRAINT "FK_0f3775a66466a4be5293db71421"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f745fb393b076c4c503437291b"`,
    );
    await queryRunner.query(`DROP TABLE "documents_template"`);
  }
}
