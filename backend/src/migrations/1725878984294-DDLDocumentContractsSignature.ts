import { MigrationInterface, QueryRunner } from 'typeorm';

export class DDLDocumentContractsSignature1725878984294
  implements MigrationInterface
{
  name = 'DDLDocumentContractsSignature1725878984294';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "document_signature" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "signature" text NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_36de69dee9bd822839c659c60a5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8c0295ec75967828329ef52ac3" ON "document_signature" ("created_on") `,
    );
    await queryRunner.query(
      `CREATE TABLE "document_contract" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."document_contract_status_enum" NOT NULL DEFAULT 'CREATED', "document_number" text NOT NULL, "document_date" date NOT NULL, "document_start_date" date NOT NULL, "document_end_date" date NOT NULL, "file_path" text, "volunteer_data" jsonb NOT NULL, "volunteer_tutor_data" jsonb, "volunteer_id" uuid NOT NULL, "organization_id" uuid NOT NULL, "document_template_id" uuid, "created_by_admin_id" uuid NOT NULL, "ngo_legal_representative_signature_id" uuid, "volunteer_signature_id" uuid, "tutor_signature_id" uuid, CONSTRAINT "PK_bc0002326db7d928c061fc90953" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0bc738c91555e8a0ef9836de02" ON "document_contract" ("created_on") `,
    );
    await queryRunner.query(
      `CREATE TABLE "document_template" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "organization_data" jsonb NOT NULL, "document_terms" text NOT NULL, "organization_id" uuid NOT NULL, "created_by_admin_id" uuid, CONSTRAINT "PK_0e9c5bda0dd75f3bde7ae176c62" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6dfe1cd0474df5d7d716bf59f0" ON "document_template" ("created_on") `,
    );
    await queryRunner.query(
      `ALTER TABLE "document_signature" ADD CONSTRAINT "FK_6e59057f55354293bf9f5e0a8df" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" ADD CONSTRAINT "FK_7617b71c917deb25a66df28843d" FOREIGN KEY ("volunteer_id") REFERENCES "volunteer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" ADD CONSTRAINT "FK_8a7ea2aea4dc1cf32f367850602" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" ADD CONSTRAINT "FK_8167fbb2efdbc38871cf081515a" FOREIGN KEY ("document_template_id") REFERENCES "document_template"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" ADD CONSTRAINT "FK_8de249c663986ee044dbef54fac" FOREIGN KEY ("created_by_admin_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" ADD CONSTRAINT "FK_24ce6d12fac4a65325e44396e47" FOREIGN KEY ("ngo_legal_representative_signature_id") REFERENCES "document_signature"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" ADD CONSTRAINT "FK_e82ad9df7db32f7c2d9034bba5f" FOREIGN KEY ("volunteer_signature_id") REFERENCES "document_signature"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" ADD CONSTRAINT "FK_8586b2b6c023b4a93d301363004" FOREIGN KEY ("tutor_signature_id") REFERENCES "document_signature"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_template" ADD CONSTRAINT "FK_5b878af38db8ff501cbba07d97b" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_template" ADD CONSTRAINT "FK_efd8efceb4027c6e48af499e005" FOREIGN KEY ("created_by_admin_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`CREATE VIEW "DocumentContractListView" AS 
    SELECT
        document_contract.id as document_id,
        document_contract.document_number as document_number,
        document_contract.status as status,
        document_contract.document_start_date as document_start_date,
        document_contract.document_end_date as document_end_date,
        document_contract.file_path AS document_file_path,
        organization.id AS organization_id,
        organization.name AS organization_name,
        volunteer.id AS volunteer_id,
        "user"."name" AS volunteer_name
    FROM
        document_contract
        JOIN volunteer ON document_contract.volunteer_id = volunteer.id
        JOIN "user" ON "user".id = volunteer.user_id
        JOIN organization ON document_contract.organization_id = organization.id
  `);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'DocumentContractListView',
        'SELECT\n        document_contract.id as document_id,\n        document_contract.document_number as document_number,\n        document_contract.status as status,\n        document_contract.document_start_date as document_start_date,\n        document_contract.document_end_date as document_end_date,\n        document_contract.file_path AS document_file_path,\n        organization.id AS organization_id,\n        organization.name AS organization_name,\n        volunteer.id AS volunteer_id,\n        "user"."name" AS volunteer_name\n    FROM\n        document_contract\n        JOIN volunteer ON document_contract.volunteer_id = volunteer.id\n        JOIN "user" ON "user".id = volunteer.user_id\n        JOIN organization ON document_contract.organization_id = organization.id',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'DocumentContractListView', 'public'],
    );
    await queryRunner.query(`DROP VIEW "DocumentContractListView"`);
    await queryRunner.query(
      `ALTER TABLE "document_template" DROP CONSTRAINT "FK_efd8efceb4027c6e48af499e005"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_template" DROP CONSTRAINT "FK_5b878af38db8ff501cbba07d97b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" DROP CONSTRAINT "FK_8586b2b6c023b4a93d301363004"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" DROP CONSTRAINT "FK_e82ad9df7db32f7c2d9034bba5f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" DROP CONSTRAINT "FK_24ce6d12fac4a65325e44396e47"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" DROP CONSTRAINT "FK_8de249c663986ee044dbef54fac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" DROP CONSTRAINT "FK_8167fbb2efdbc38871cf081515a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" DROP CONSTRAINT "FK_8a7ea2aea4dc1cf32f367850602"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_contract" DROP CONSTRAINT "FK_7617b71c917deb25a66df28843d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_signature" DROP CONSTRAINT "FK_6e59057f55354293bf9f5e0a8df"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6dfe1cd0474df5d7d716bf59f0"`,
    );
    await queryRunner.query(`DROP TABLE "document_template"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0bc738c91555e8a0ef9836de02"`,
    );
    await queryRunner.query(`DROP TABLE "document_contract"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8c0295ec75967828329ef52ac3"`,
    );
    await queryRunner.query(`DROP TABLE "document_signature"`);
  }
}
