import { MigrationInterface, QueryRunner } from 'typeorm';

export class Announcement1677153298464 implements MigrationInterface {
  name = 'Announcement1677153298464';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."announcement_status_enum" AS ENUM('draft', 'published')`,
    );
    await queryRunner.query(
      `CREATE TABLE "announcement" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "description" text NOT NULL, "status" "public"."announcement_status_enum" NOT NULL, "published_on" TIMESTAMP WITH TIME ZONE, "organization_id" uuid NOT NULL, CONSTRAINT "PK_e0ef0550174fd1099a308fd18a0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6f99d5dde7bbeff3c7479afc55" ON "announcement" ("created_on") `,
    );
    await queryRunner.query(
      `CREATE TABLE "announcement_targets_organization_structure" ("announcementId" uuid NOT NULL, "organizationStructureId" uuid NOT NULL, CONSTRAINT "PK_25e1e613e0b41b1de27c6a9ab92" PRIMARY KEY ("announcementId", "organizationStructureId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_159513eff2a776b332518cd09b" ON "announcement_targets_organization_structure" ("announcementId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e17282ab0fe6924f453939bb51" ON "announcement_targets_organization_structure" ("organizationStructureId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" DROP CONSTRAINT "FK_780343b632ab25cd9dcfb95c133"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" DROP CONSTRAINT "name_organization"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" ALTER COLUMN "organization_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" ADD CONSTRAINT "name_organization" UNIQUE ("name", "organization_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" ADD CONSTRAINT "FK_780343b632ab25cd9dcfb95c133" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD CONSTRAINT "FK_d0e0c1a45e8b2771e628c0d6f01" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_targets_organization_structure" ADD CONSTRAINT "FK_159513eff2a776b332518cd09b4" FOREIGN KEY ("announcementId") REFERENCES "announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_targets_organization_structure" ADD CONSTRAINT "FK_e17282ab0fe6924f453939bb513" FOREIGN KEY ("organizationStructureId") REFERENCES "organization_structure"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD "targeted_volunteers" integer NOT NULL DEFAULT '0'`,
    );
    // should this be removed and just alter the existing FK on creation?
    await queryRunner.query(
      `ALTER TABLE "announcement_targets_organization_structure" DROP CONSTRAINT "FK_159513eff2a776b332518cd09b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_targets_organization_structure" ADD CONSTRAINT "FK_159513eff2a776b332518cd09b4" FOREIGN KEY ("announcementId") REFERENCES "announcement"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcement_targets_organization_structure" DROP CONSTRAINT "FK_e17282ab0fe6924f453939bb513"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_targets_organization_structure" DROP CONSTRAINT "FK_159513eff2a776b332518cd09b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" DROP CONSTRAINT "FK_d0e0c1a45e8b2771e628c0d6f01"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" DROP CONSTRAINT "FK_780343b632ab25cd9dcfb95c133"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" DROP CONSTRAINT "name_organization"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" ALTER COLUMN "organization_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" ADD CONSTRAINT "name_organization" UNIQUE ("name", "organization_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" ADD CONSTRAINT "FK_780343b632ab25cd9dcfb95c133" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e17282ab0fe6924f453939bb51"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_159513eff2a776b332518cd09b"`,
    );
    await queryRunner.query(
      `DROP TABLE "announcement_targets_organization_structure"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6f99d5dde7bbeff3c7479afc55"`,
    );
    await queryRunner.query(`DROP TABLE "announcement"`);
    await queryRunner.query(`DROP TYPE "public"."announcement_status_enum"`);
  }
}
