import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTemplateEntity1686571281572 implements MigrationInterface {
  name = 'AddTemplateEntity1686571281572';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "template" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "organization_id" uuid NOT NULL, CONSTRAINT "PK_fbae2ac36bd9b5e1e793b957b7f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6cab0f1d44fcc58ea8b90cbdde" ON "template" ("created_on") `,
    );
    await queryRunner.query(
      `ALTER TABLE "template" ADD CONSTRAINT "FK_ddef319853f6bdbc411b8874a66" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "template" DROP CONSTRAINT "FK_ddef319853f6bdbc411b8874a66"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6cab0f1d44fcc58ea8b90cbdde"`,
    );
    await queryRunner.query(`DROP TABLE "template"`);
  }
}
