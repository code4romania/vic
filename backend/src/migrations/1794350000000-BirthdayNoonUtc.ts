import { MigrationInterface, QueryRunner } from 'typeorm';

// #584: birthdays were saved as local midnight in Romania (21:00 or 22:00 UTC of the day before),
// so anything reading them in UTC showed one day earlier. Store each one as noon UTC of its
// Romanian calendar day, which is what the app now sends. Running it again changes nothing.
export class BirthdayNoonUtc1794350000000 implements MigrationInterface {
  name = 'BirthdayNoonUtc1794350000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "user"
      SET "birthday" = (("birthday" AT TIME ZONE 'Europe/Bucharest')::date + time '12:00') AT TIME ZONE 'UTC'
      WHERE "birthday" IS NOT NULL
    `);
  }

  public async down(): Promise<void> {
    // The original instants are not needed: the calendar day is unchanged.
  }
}
