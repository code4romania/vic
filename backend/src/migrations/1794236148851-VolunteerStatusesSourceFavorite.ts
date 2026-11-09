import { MigrationInterface, QueryRunner } from 'typeorm';

// VIC 2.0, issue #472: volunteer statuses Active / Inactive / Blocked / Candidate,
// plus source, favorite flag and user.has_account.
// Existing volunteers keep their status: active stays active, archived becomes inactive
// (a rename of the enum value, so no row is rewritten), blocked stays blocked.
export class VolunteerStatusesSourceFavorite1794236148851
  implements MigrationInterface
{
  name = 'VolunteerStatusesSourceFavorite1794236148851';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const type of [
      'volunteer_status_enum',
      'volunteer_history_status_enum',
    ]) {
      await queryRunner.query(
        `ALTER TYPE "public"."${type}" RENAME VALUE 'archived' TO 'inactive'`,
      );
      await queryRunner.query(
        `ALTER TYPE "public"."${type}" ADD VALUE IF NOT EXISTS 'candidate'`,
      );
    }

    for (const table of ['volunteer', 'volunteer_history']) {
      await queryRunner.query(`ALTER TABLE "${table}" ADD "source" text`);
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD "is_favorite" boolean NOT NULL DEFAULT false`,
      );
    }

    // Everybody who exists today signed up themselves, so they all have an account.
    await queryRunner.query(
      `ALTER TABLE "user" ADD "has_account" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "has_account"`);

    for (const table of ['volunteer', 'volunteer_history']) {
      await queryRunner.query(
        `ALTER TABLE "${table}" DROP COLUMN "is_favorite"`,
      );
      await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN "source"`);
      // Postgres cannot drop an enum value (and a view depends on the history column):
      // candidates become archived, and the unused 'candidate' label stays in the type.
      await queryRunner.query(
        `UPDATE "${table}" SET "status" = 'inactive' WHERE "status" = 'candidate'`,
      );
    }

    for (const type of [
      'volunteer_status_enum',
      'volunteer_history_status_enum',
    ]) {
      await queryRunner.query(
        `ALTER TYPE "public"."${type}" RENAME VALUE 'inactive' TO 'archived'`,
      );
    }
  }
}
