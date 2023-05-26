import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPersonalData1685017566505 implements MigrationInterface {
  name = 'AddUserPersonalData1685017566505';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_personal_data" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "identity_document_series" text NOT NULL, "identity_document_number" text NOT NULL, "address" text NOT NULL, "identity_document_issue_date" TIMESTAMP WITH TIME ZONE NOT NULL, "identity_document_expiration_date" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_dc8908edcc104d4b012d923e980" UNIQUE ("identity_document_series"), CONSTRAINT "UQ_a43393c324223214daef1914850" UNIQUE ("identity_document_number"), CONSTRAINT "PK_fc4821895c2d37e8d15e0f3091f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_49235869ffe0a117c6083ed0bd" ON "user_personal_data" ("created_on") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "user_personal_data_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_2b2baf0ae6126157be8811c4eb4" UNIQUE ("user_personal_data_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_2b2baf0ae6126157be8811c4eb4" FOREIGN KEY ("user_personal_data_id") REFERENCES "user_personal_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_2b2baf0ae6126157be8811c4eb4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_2b2baf0ae6126157be8811c4eb4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "user_personal_data_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_49235869ffe0a117c6083ed0bd"`,
    );
    await queryRunner.query(`DROP TABLE "user_personal_data"`);
  }
}
