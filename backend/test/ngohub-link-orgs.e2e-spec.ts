import { DataSource } from 'typeorm';
import {
  LinkNgoHubOrganizationsUseCase,
  NgoHubOrganizationRecord,
} from 'src/usecases/organization/link-ngohub-organizations.usecase';
import { createTestDataSource, truncate } from './utils/test-data-source';

// Login with NGO Hub, issue 06: npm run ngohub:link-orgs.
describe('Linking VIC organizations to NGO Hub (e2e)', () => {
  let dataSource: DataSource;
  let useCase: LinkNgoHubOrganizationsUseCase;
  let counter = 0;

  const vic = async (
    fields: {
      name?: string;
      taxId?: string | null;
      email?: string;
      phone?: string;
      ngohubId?: number;
    } = {},
  ): Promise<string> => {
    counter++;
    return (
      await dataSource.query(
        `INSERT INTO organization (name, email, phone, status, tax_id, ngohub_organization_id)
         VALUES ($1, $2, $3, 'active', $4, $5) RETURNING id`,
        [
          fields.name ?? `Org ${counter}`,
          fields.email ?? `org${counter}@vic.ro`,
          fields.phone ?? `+4070000${String(counter).padStart(4, '0')}`,
          fields.taxId ?? null,
          fields.ngohubId ?? null,
        ],
      )
    )[0].id;
  };

  const hub = (
    id: number,
    fields: Partial<NgoHubOrganizationRecord> = {},
  ): NgoHubOrganizationRecord => ({
    id,
    cui: null,
    name: `Hub ${id}`,
    email: `hub${id}@ngohub.ro`,
    phone: `+4079999${String(id).padStart(4, '0')}`,
    ...fields,
  });

  const linkOf = async (id: string): Promise<number | null> =>
    (
      await dataSource.query(
        `SELECT ngohub_organization_id AS id FROM organization WHERE id = $1`,
        [id],
      )
    )[0].id;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    useCase = new LinkNgoHubOrganizationsUseCase(dataSource);
  });

  beforeEach(async () => {
    await truncate(dataSource, ['organization']);
  });

  afterAll(async () => {
    await dataSource?.destroy();
  });

  it('a dry run reports exact CUI matches and writes nothing', async () => {
    const exact = await vic({ taxId: '12345678' });
    const report = await useCase.execute([hub(1, { cui: 'RO 012345678' })], {
      apply: false,
    });

    expect(report.exact).toEqual([
      expect.objectContaining({ vicId: exact, ngohubId: 1, cui: '12345678' }),
    ]);
    expect(report.applied).toBe(0);
    expect(await linkOf(exact)).toBeNull();
  });

  it('--apply writes only exact CUI matches; candidates and conflicts stay unwritten', async () => {
    const exact = await vic({ taxId: '12345678' });
    const byName = await vic({ name: 'Asociația Ăla-Bala', taxId: null });
    const byPhone = await vic({ phone: '0712 345 678' });
    const twoOnHub = await vic({ taxId: '22222222' });
    const linked = await vic({ taxId: '33333333', ngohubId: 9 });
    const alone = await vic();

    const report = await useCase.execute(
      [
        hub(1, { cui: '12345678' }),
        hub(2, { name: 'ASOCIATIA ALA BALA' }),
        hub(3, { phone: '+40712345678' }),
        hub(4, { cui: '22222222' }),
        hub(5, { cui: 'RO22222222' }),
        hub(6, { cui: '33333333' }),
      ],
      { apply: true },
    );

    expect(report.applied).toBe(1);
    expect(await linkOf(exact)).toBe(1);
    for (const id of [byName, byPhone, twoOnHub, alone]) {
      expect(await linkOf(id)).toBeNull();
    }
    expect(await linkOf(linked)).toBe(9);

    expect(report.alreadyLinked).toBe(1);
    expect(report.candidates).toEqual([
      expect.objectContaining({ vicId: byName, ngohubId: 2, on: ['name'] }),
      expect.objectContaining({ vicId: byPhone, ngohubId: 3, on: ['phone'] }),
    ]);
    expect(report.conflicts).toEqual([
      expect.objectContaining({ vicId: twoOnHub, cui: '22222222' }),
    ]);
    expect(report.unmatched).toBe(1);
  });

  it('never takes an NGO Hub id another VIC organization already has', async () => {
    await vic({ taxId: '87654321', ngohubId: 1 });
    const other = await vic({ taxId: '12345678' });

    const report = await useCase.execute([hub(1, { cui: '12345678' })], {
      apply: true,
    });

    expect(report.exact).toEqual([]);
    expect(report.conflicts).toEqual([
      expect.objectContaining({
        vicId: other,
        reason: expect.stringContaining('already linked'),
      }),
    ]);
    expect(await linkOf(other)).toBeNull();
  });

  it('leaves an organization a login linked since the report', async () => {
    const org = await vic({ taxId: '12345678' });
    const dry = await useCase.execute([hub(1, { cui: '12345678' })], {
      apply: false,
    });
    expect(dry.exact).toHaveLength(1);
    await dataSource.query(
      `UPDATE organization SET ngohub_organization_id = 7 WHERE id = $1`,
      [org],
    );

    const report = await useCase.execute([hub(1, { cui: '12345678' })], {
      apply: true,
    });
    expect(report.applied).toBe(0);
    expect(await linkOf(org)).toBe(7);
  });
});
