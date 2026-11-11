import { MigrationInterface, QueryRunner } from 'typeorm';
import { CITY_DIACRITICS } from './seed/city-diacritics';

// Writes the city names with diacritics, as CountyDiacritics did for the counties. Ids stay the
// same and a row is only touched while it still has the expected old name, so a name changed by
// hand is left alone. The ~120 cities SIRUTA has no single spelling for keep their current name.
export class CityDiacritics1794440000000 implements MigrationInterface {
  name = 'CityDiacritics1794440000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.rename(queryRunner, CITY_DIACRITICS);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.rename(
      queryRunner,
      CITY_DIACRITICS.map(([id, original, corrected]) => [
        id,
        corrected,
        original,
      ]),
    );
  }

  private async rename(
    queryRunner: QueryRunner,
    rows: [number, string, string][],
  ): Promise<void> {
    await queryRunner.query(
      `UPDATE "_city" AS city
       SET "name" = spelling.corrected
       FROM unnest($1::int[], $2::text[], $3::text[]) AS spelling(id, original, corrected)
       WHERE city."id" = spelling.id AND city."name" = spelling.original`,
      [
        rows.map(([id]) => id),
        rows.map(([, from]) => from),
        rows.map(([, , to]) => to),
      ],
    );
  }
}
