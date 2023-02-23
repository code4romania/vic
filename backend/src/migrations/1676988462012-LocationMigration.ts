import { MigrationInterface, QueryRunner } from 'typeorm';

export class LocationMigration1676988462012 implements MigrationInterface {
  name = 'LocationMigration1676988462012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "_county" ("id" integer NOT NULL, "name" text NOT NULL, "abbreviation" text NOT NULL, CONSTRAINT "PK_8ed2f9c8ce877360cd353f8d099" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "_city" ("id" integer NOT NULL, "name" text NOT NULL, "county_id" integer, CONSTRAINT "PK_beca9451002e9a531c4155cf2e2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_71eac5c52a71a62e98911f36b8" ON "_city" ("county_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "_city" ADD CONSTRAINT "FK_71eac5c52a71a62e98911f36b8b" FOREIGN KEY ("county_id") REFERENCES "_county"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "_city" DROP CONSTRAINT "FK_71eac5c52a71a62e98911f36b8b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_71eac5c52a71a62e98911f36b8"`,
    );
    await queryRunner.query(`DROP TABLE "_city"`);
    await queryRunner.query(`DROP TABLE "_county"`);
  }
}
