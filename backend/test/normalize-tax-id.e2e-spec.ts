import { NormalizeTaxId1794420000000 } from 'src/migrations/1794420000000-NormalizeTaxId';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// M9: the migration normalizes the stored CUIs and leaves the ones that would collide as they are.
describe('Normalize tax ids migration (e2e)', () => {
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  it('normalizes what it can and reports duplicates instead of failing', async () => {
    await truncate(testApp.dataSource, ['organization']);
    let n = 0;
    const insert = (name: string, taxId: string): Promise<unknown> =>
      testApp.dataSource.query(
        `INSERT INTO organization (name, email, phone, tax_id) VALUES ($1, $1 || '@x.ro', $3, $2)`,
        [name, taxId, `+4070000000${++n}`],
      );
    await insert('Unu', 'RO 18547290');
    await insert('Doi', 'ro014350073');
    await insert('Trei', 'RO12345674');
    await insert('Patru', '12345674');

    const runner = testApp.dataSource.createQueryRunner();
    try {
      await new NormalizeTaxId1794420000000().up(runner);
    } finally {
      await runner.release();
    }

    const rows: { name: string; tax_id: string }[] =
      await testApp.dataSource.query(
        `SELECT name, tax_id FROM organization ORDER BY name`,
      );
    expect(Object.fromEntries(rows.map((r) => [r.name, r.tax_id]))).toEqual({
      Unu: '18547290',
      Doi: '14350073',
      // a duplicate once normalized: left for the VIC team
      Trei: 'RO12345674',
      Patru: '12345674',
    });
  });
});
