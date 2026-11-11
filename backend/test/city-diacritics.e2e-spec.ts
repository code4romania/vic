import { CityDiacritics1794440000000 } from 'src/migrations/1794440000000-CityDiacritics';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// #637: city names carry diacritics (SIRUTA); the migration keeps ids, and searching without
// diacritics still finds them.
describe('City names with diacritics (e2e)', () => {
  let testApp: TestApp;

  const names = async (): Promise<{ id: number; name: string }[]> =>
    testApp.dataSource.query(`SELECT id, name FROM _city ORDER BY id`);

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  beforeEach(async () => {
    await truncate(testApp.dataSource, ['_city', '_county']);
    await testApp.dataSource.query(
      `INSERT INTO _county (id, name, abbreviation) VALUES (41, 'Mureș', 'MS'), (6, 'Bihor', 'BH')`,
    );
  });

  it('the migration renames by id, leaves edited and unknown names alone, and reverts', async () => {
    // 7 Abramut (Bihor) and 11939 Targu Mures are in the SIRUTA list; 572 "Balc" is ambiguous there
    await testApp.dataSource.query(
      `INSERT INTO _city (id, name, county_id) VALUES
         (7, 'Abramut', 6), (11939, 'Targu Mures', 41), (572, 'Balc', 6), (13, 'Abuș (editat)', 41)`,
    );
    const migration = new CityDiacritics1794440000000();
    const runner = testApp.dataSource.createQueryRunner();
    try {
      await migration.up(runner);
      expect(await names()).toEqual([
        { id: 7, name: 'Abrămuț' },
        { id: 13, name: 'Abuș (editat)' },
        { id: 572, name: 'Balc' },
        { id: 11939, name: 'Târgu Mureș' },
      ]);

      await migration.down(runner);
      expect(await names()).toEqual([
        { id: 7, name: 'Abramut' },
        { id: 13, name: 'Abuș (editat)' },
        { id: 572, name: 'Balc' },
        { id: 11939, name: 'Targu Mures' },
      ]);
    } finally {
      await runner.release();
    }
  });

  it('the city search ignores case and diacritics', async () => {
    await testApp.dataSource.query(
      `INSERT INTO _city (id, name, county_id) VALUES (11939, 'Târgu Mureș', 41), (7, 'Abrămuț', 6)`,
    );
    const search = async (term: string): Promise<string[]> =>
      (
        await request(testApp.app.getHttpServer())
          .get('/location/city')
          .query({ search: term })
          .expect(200)
      ).body.items.map(({ name }: { name: string }) => name);

    expect(await search('targu mures')).toEqual(['Târgu Mureș']);
    expect(await search('TÂRGU MUREŞ')).toEqual(['Târgu Mureș']);
    expect(await search('abramut')).toEqual(['Abrămuț']);
    expect(await search('mureș')).toEqual(['Târgu Mureș']);
  });
});
