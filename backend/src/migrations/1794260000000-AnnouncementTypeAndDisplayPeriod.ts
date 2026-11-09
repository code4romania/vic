import { MigrationInterface, QueryRunner } from 'typeorm';

// VIC 2.0, issue #503: announcements get a type, the number of volunteers needed and a
// display period; drafts and targets go away; archiving is manual.
// Existing rows: published -> active, draft -> inactive (enum values renamed),
// shown from their publish date (or creation date) with no end; type = recruitment.
// Targeted announcements now reach the whole organization (the targets table is dropped).
export class AnnouncementTypeAndDisplayPeriod1794260000000
  implements MigrationInterface
{
  name = 'AnnouncementTypeAndDisplayPeriod1794260000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."announcement_status_enum" RENAME VALUE 'published' TO 'active'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."announcement_status_enum" RENAME VALUE 'draft' TO 'inactive'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."announcement_status_enum" ADD VALUE IF NOT EXISTS 'archived'`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."announcement_type_enum" AS ENUM('recruitment', 'activity')`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD "type" "public"."announcement_type_enum" NOT NULL DEFAULT 'recruitment'`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD "volunteers_needed" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD "display_start_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `UPDATE "announcement" SET "display_start_date" = COALESCE("published_on", "created_on")`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ALTER COLUMN "display_start_date" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD "display_end_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD "archived_on" TIMESTAMP WITH TIME ZONE`,
    );

    await queryRunner.query(
      `DROP TABLE "announcement_targets_organization_structure"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Targets cannot come back; archived announcements become drafts again.
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
      `ALTER TABLE "announcement_targets_organization_structure" ADD CONSTRAINT "FK_159513eff2a776b332518cd09b4" FOREIGN KEY ("announcementId") REFERENCES "announcement"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_targets_organization_structure" ADD CONSTRAINT "FK_e17282ab0fe6924f453939bb513" FOREIGN KEY ("organizationStructureId") REFERENCES "organization_structure"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "announcement" DROP COLUMN "archived_on"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" DROP COLUMN "display_end_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" DROP COLUMN "display_start_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" DROP COLUMN "volunteers_needed"`,
    );
    await queryRunner.query(`ALTER TABLE "announcement" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."announcement_type_enum"`);

    await queryRunner.query(
      `UPDATE "announcement" SET "status" = 'inactive' WHERE "status" = 'archived'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."announcement_status_enum" RENAME VALUE 'active' TO 'published'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."announcement_status_enum" RENAME VALUE 'inactive' TO 'draft'`,
    );
  }
}
