import { MigrationInterface, QueryRunner } from 'typeorm';

export class PushTokensDDL1683895350508 implements MigrationInterface {
  name = 'PushTokensDDL1683895350508';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "push_tokens" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" text NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "UQ_869b4a9ba2c9e030aafc4b7dc7a" UNIQUE ("token"), CONSTRAINT "PK_32734e87f299c29ca3878861f4f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_54642a7be5a61ec121b82f5f12" ON "push_tokens" ("created_on") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_869b4a9ba2c9e030aafc4b7dc7" ON "push_tokens" ("token") `,
    );
    await queryRunner.query(
      `ALTER TABLE "push_tokens" ADD CONSTRAINT "FK_94c371aff70dedeb89dae39f440" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "push_tokens" DROP CONSTRAINT "FK_94c371aff70dedeb89dae39f440"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_869b4a9ba2c9e030aafc4b7dc7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_54642a7be5a61ec121b82f5f12"`,
    );
    await queryRunner.query(`DROP TABLE "push_tokens"`);
  }
}
