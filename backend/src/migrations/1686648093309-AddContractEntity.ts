import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContractEntity1686648093309 implements MigrationInterface {
  name = 'AddContractEntity1686648093309';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."contract_status_enum" AS ENUM('PENDING_VOLUNTEER', 'PENDING_ADMIN', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "contract" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "contract_number" text NOT NULL, "path" text NOT NULL, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."contract_status_enum" NOT NULL DEFAULT 'PENDING_VOLUNTEER', "organization_id" uuid NOT NULL, "template_id" uuid, "volunteer_id" uuid NOT NULL, CONSTRAINT "PK_17c3a89f58a2997276084e706e8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0c60eebe1a899511d0106ed261" ON "contract" ("created_on") `,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "FK_4111ed7cd731d530775738e43e8" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "FK_4bd19cbbc18731c95e0fe5004bb" FOREIGN KEY ("template_id") REFERENCES "template"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "FK_848d11e5204f23e9b561a27431f" FOREIGN KEY ("volunteer_id") REFERENCES "volunteer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract" DROP CONSTRAINT "FK_848d11e5204f23e9b561a27431f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" DROP CONSTRAINT "FK_4bd19cbbc18731c95e0fe5004bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" DROP CONSTRAINT "FK_4111ed7cd731d530775738e43e8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0c60eebe1a899511d0106ed261"`,
    );
    await queryRunner.query(`DROP TABLE "contract"`);
    await queryRunner.query(`DROP TYPE "public"."contract_status_enum"`);
  }
}
