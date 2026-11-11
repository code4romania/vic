import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { ContractStatuses1794310000000 } from 'src/migrations/1794310000000-ContractStatuses';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

const PDF = Buffer.from(
  '%PDF-1.4\n%test\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF',
);
const DAY = 24 * 60 * 60 * 1000;
const days = (n: number): Date => new Date(Date.now() + n * DAY);

// #488 and #486: contracts are Active/Inactive, shown as Semnat / În așteptare / Expirat (+ Expiră în
// curând), and the NGO uploads them already signed, with their period.
describe('Contracts (e2e)', () => {
  let testApp: TestApp;
  let adminToken: string;
  let organizationId: string;
  let volunteerId: string;
  let otherVolunteerId: string;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  beforeEach(async () => {
    await truncate(testApp.dataSource, [
      'activity_log',
      'contract',
      'auth_identity',
      'volunteer',
      'user',
      'organization',
    ]);
    const [org] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone, status, validated_at, tax_id, address)
       VALUES ('Crucea Verde', 'org@crucea.ro', '+40700000001', 'active', now(), '12345678', 'Str. Lalelelor 3, Cluj') RETURNING id`,
    );
    organizationId = org.id;
    const [other] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone, status, validated_at)
       VALUES ('Alt ONG', 'org@alt.ro', '+40700000002', 'active', now()) RETURNING id`,
    );
    const [admin] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Ana', 'ana@crucea.ro', '+40710000002', $1) RETURNING id`,
      [organizationId],
    );
    adminToken = await testApp.mintAccessToken(
      await testApp.app.get(AuthIdentityFacade).createIdentity({
        realm: AuthRealm.WEB,
        email: 'ana@crucea.ro',
        status: AuthIdentityStatus.ACTIVE,
        userId: admin.id,
      }),
      AuthRealm.WEB,
    );
    const [user] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone)
       VALUES ('regular', 'Elena Pop', 'elena@example.ro', '+40720000001') RETURNING id`,
    );
    [{ id: volunteerId }] = await testApp.dataSource.query(
      `INSERT INTO volunteer (user_id, organization_id, status) VALUES ($1, $2, 'active') RETURNING id`,
      [user.id, organizationId],
    );
    [{ id: otherVolunteerId }] = await testApp.dataSource.query(
      `INSERT INTO volunteer (user_id, organization_id, status) VALUES ($1, $2, 'active') RETURNING id`,
      [user.id, other.id],
    );
  });

  const http = (): ReturnType<typeof request> =>
    request(testApp.app.getHttpServer());
  const auth = (r: request.Test): request.Test =>
    r.set('Authorization', `Bearer ${adminToken}`);

  const insert = (
    status: string,
    startDate: Date,
    endDate: Date | null,
    contractNumber: string,
  ): Promise<unknown> =>
    testApp.dataSource.query(
      `INSERT INTO contract (contract_number, path, start_date, end_date, status, organization_id, volunteer_id)
       VALUES ($1, 'contracts/x.pdf', $2, $3, $4, $5, $6)`,
      [contractNumber, startDate, endDate, status, organizationId, volunteerId],
    );

  const upload = (
    fields: Record<string, string>,
    file: Buffer | null = PDF,
    name = 'semnat.pdf',
    contentType = 'application/pdf',
  ): request.Test => {
    let r = auth(http().post('/contract'));
    for (const [key, value] of Object.entries({ volunteerId, ...fields })) {
      r = r.field(key, value);
    }
    return file
      ? r.attach('contract', file, { filename: name, contentType })
      : r;
  };

  it('migrates the old statuses: approved -> active, the rest -> inactive', async () => {
    const queryRunner = testApp.dataSource.createQueryRunner();
    const migration = new ContractStatuses1794310000000();
    try {
      await migration.down(queryRunner);
      for (const [n, status, end] of [
        ['1', 'APPROVED', days(100)],
        ['2', 'APPROVED', days(-1)],
        ['3', 'PENDING_VOLUNTEER', days(100)],
        ['4', 'PENDING_ADMIN', days(100)],
        ['5', 'REJECTED', days(100)],
        ['6', 'PENDING_VOLUNTEER', days(-5)],
      ] as const) {
        await insert(status, days(-200), end, n);
      }
    } finally {
      await migration.up(queryRunner);
      await queryRunner.release();
    }

    const rows: { contract_number: string; status: string }[] =
      await testApp.dataSource.query(
        `SELECT contract_number, status FROM contract ORDER BY contract_number`,
      );
    expect(rows.map((r) => r.status)).toEqual([
      'ACTIVE',
      'ACTIVE',
      'INACTIVE',
      'INACTIVE',
      'INACTIVE',
      'INACTIVE',
    ]);

    const { body } = await auth(
      http().get('/contract?orderBy=contractNumber&orderDirection=ASC'),
    ).expect(200);
    expect(
      body.items.map((c: { contractNumber: string; status: string }) => [
        c.contractNumber,
        c.status,
      ]),
    ).toEqual([
      ['1', 'SIGNED'],
      ['2', 'EXPIRED'],
      ['3', 'PENDING'],
      ['4', 'PENDING'],
      ['5', 'PENDING'],
      ['6', 'EXPIRED'],
    ]);
  });

  it('computes "Expiră în curând" and filters by the shown status', async () => {
    await insert('ACTIVE', days(-300), days(10), 'soon');
    await insert('ACTIVE', days(-300), days(90), 'later');
    await insert('ACTIVE', days(-300), null, 'forever');
    await insert('ACTIVE', days(-300), days(-1), 'gone');
    await insert('INACTIVE', days(-3), days(10), 'waiting');

    const { body } = await auth(
      http().get('/contract?orderBy=contractNumber&orderDirection=ASC'),
    ).expect(200);
    const shown = Object.fromEntries(
      body.items.map(
        (c: {
          contractNumber: string;
          status: string;
          expiringSoon: boolean;
        }) => [c.contractNumber, [c.status, c.expiringSoon]],
      ),
    );
    expect(shown).toEqual({
      soon: ['SIGNED', true],
      later: ['SIGNED', false],
      forever: ['SIGNED', false],
      gone: ['EXPIRED', false],
      waiting: ['PENDING', false],
    });

    const filtered = async (status: string): Promise<string[]> =>
      (
        await auth(http().get(`/contract?status=${status}`)).expect(200)
      ).body.items
        .map((c: { contractNumber: string }) => c.contractNumber)
        .sort();
    expect(await filtered('SIGNED')).toEqual(['forever', 'later', 'soon']);
    expect(await filtered('PENDING')).toEqual(['waiting']);
    expect(await filtered('EXPIRED')).toEqual(['gone']);
    await auth(http().get('/contract?status=APPROVED')).expect(400);

    // the dashboard's pending count
    expect((await auth(http().get('/contract/active')).expect(200)).text).toBe(
      '1',
    );
    // the counters on top of the contracts page
    expect(
      (await auth(http().get('/contract/counters')).expect(200)).body,
    ).toEqual({ SIGNED: 3, PENDING: 1, EXPIRED: 1, EXPIRING_SOON: 1 });
    // #489: the "Expiră în curând" filter
    expect(await filtered('EXPIRING_SOON')).toEqual(['soon']);

    // each row carries the volunteer's email, and the search matches it
    expect(body.items[0].volunteerEmail).toEqual(expect.any(String));
    const byEmail = (
      await auth(
        http().get(
          `/contract?search=${encodeURIComponent(body.items[0].volunteerEmail)}`,
        ),
      ).expect(200)
    ).body.items;
    expect(byEmail).toHaveLength(5);
  });

  it("lists an inactive volunteer's contracts like the counters; a contract is valid through its last day in Bucharest", async () => {
    // ends today (stored as today's midnight UTC, the way a date-only field arrives): still signed
    const today = new Date(
      new Date()
        .toLocaleDateString('en-CA', { timeZone: 'Europe/Bucharest' })
        .concat('T00:00:00Z'),
    );
    await insert('ACTIVE', days(-300), today, 'azi');
    await insert('ACTIVE', days(-300), days(-2), 'ieri');
    await testApp.dataSource.query(
      `UPDATE volunteer SET status = 'inactive' WHERE id = $1`,
      [volunteerId],
    );

    const list = async (query = ''): Promise<[string, string][]> =>
      (
        await auth(
          http().get(
            `/contract?orderBy=contractNumber&orderDirection=ASC${query}`,
          ),
        ).expect(200)
      ).body.items.map((c: { contractNumber: string; status: string }) => [
        c.contractNumber,
        c.status,
      ]);
    expect(await list()).toEqual([
      ['azi', 'SIGNED'],
      ['ieri', 'EXPIRED'],
    ]);
    expect(await list(`&volunteerId=${volunteerId}`)).toHaveLength(2);
    expect(
      (await auth(http().get('/contract/counters')).expect(200)).body,
    ).toMatchObject({ SIGNED: 1, EXPIRED: 1 });
    // diacritics-insensitive search on the volunteer's name
    await testApp.dataSource.query(
      `UPDATE "user" SET name = 'Elena Știrbu' WHERE email = 'elena@example.ro'`,
    );
    expect(await list('&search=stirbu')).toHaveLength(2);

    // a blocked volunteer's contracts leave the organization's list and counters, both alike,
    // but stay on their own tab
    await testApp.dataSource.query(
      `UPDATE volunteer SET status = 'blocked' WHERE id = $1`,
      [volunteerId],
    );
    expect(await list()).toEqual([]);
    expect(
      (await auth(http().get('/contract/counters')).expect(200)).body,
    ).toMatchObject({ SIGNED: 0, EXPIRED: 0 });
    expect(await list(`&volunteerId=${volunteerId}`)).toHaveLength(2);
  });

  it('uploads a certificate for an inactive volunteer, not for a blocked one', async () => {
    await testApp.dataSource.query(
      `UPDATE volunteer SET status = 'inactive' WHERE id = $1`,
      [volunteerId],
    );
    await upload({ startDate: '2026-01-01', type: 'CERTIFICATE' }).expect(201);
    await testApp.dataSource.query(
      `UPDATE volunteer SET status = 'blocked' WHERE id = $1`,
      [volunteerId],
    );
    const refused = await upload({
      startDate: '2026-01-01',
      type: 'CERTIFICATE',
    }).expect(400);
    expect(refused.body.code_error).toBe('VOLUNTEER_007');
  });

  it('uploads a signed PDF with its period; no end date means it never expires', async () => {
    const { body } = await upload({
      startDate: '2026-01-01',
      endDate: '',
      contractNumber: '12/2026',
    }).expect(201);
    expect(body).toMatchObject({
      contractNumber: '12/2026',
      status: 'SIGNED',
      expiringSoon: false,
      endDate: null,
      volunteer: { id: volunteerId, name: 'Elena Pop' },
    });

    const second = await upload({
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    }).expect(201);
    expect(second.body.contractNumber).toBeNull();
    expect(second.body.fileName).toMatch(/^Contract_.+\.pdf$/);

    const { body: list } = await auth(
      http().get(`/contract?volunteerId=${volunteerId}`),
    ).expect(200);
    expect(list.meta.totalItems).toBe(2);
  });

  it('refuses what is not a signed PDF, a backwards period, a repeated number or another NGO', async () => {
    const code = async (r: request.Test, status = 400): Promise<string> =>
      (await r.expect(status)).body.code_error;

    expect(await code(upload({ startDate: '2026-01-01' }, null))).toBe(
      'CONTRACT_008',
    );
    expect(
      await code(
        upload({ startDate: '2026-01-01' }, Buffer.from('not a pdf'), 'x.pdf'),
      ),
    ).toBe('CONTRACT_008');
    expect(
      await code(upload({ startDate: '2026-06-01', endDate: '2026-01-01' })),
    ).toBe('CONTRACT_009');
    await upload({ startDate: 'nu e data' }).expect(400);

    await upload({ startDate: '2026-01-01', contractNumber: 'A1' }).expect(201);
    expect(
      await code(upload({ startDate: '2026-01-01', contractNumber: 'A1' })),
    ).toBe('CONTRACT_004');

    await upload({
      startDate: '2026-01-01',
      volunteerId: otherVolunteerId,
    }).expect(404);
  });

  it('lets the NGO delete a signed upload, and the old flows are gone', async () => {
    const { body } = await upload({ startDate: '2026-01-01' }).expect(201);
    await auth(http().delete(`/contract/${body.id}`)).expect(200);
    expect(
      (
        await testApp.dataSource.query(
          `SELECT count(*)::int AS n FROM contract`,
        )
      )[0].n,
    ).toBe(0);

    await auth(http().patch(`/contract/${body.id}/confirm`)).expect(404);
    await auth(http().patch(`/contract/${body.id}/reject`)).expect(404);
  });

  // #490: "Generează adeverință"
  it('prefills a certificate with the approved hours and renders it as a PDF', async () => {
    await testApp.dataSource.query(
      `INSERT INTO activity_log (date, hours, status, volunteer_id, organization_id) VALUES
         ('2026-02-01', 4, 'approved', $1, $2),
         ('2026-03-01', 2, 'approved', $1, $2),
         ('2026-04-01', 10, 'pending', $1, $2)`,
      [volunteerId, organizationId],
    );
    const { body: prefill } = await auth(
      http().get(`/contract/certificate/prefill?volunteerId=${volunteerId}`),
    ).expect(200);
    expect(prefill).toMatchObject({
      volunteerId,
      volunteerName: 'Elena Pop',
      hours: 6,
    });
    expect(new Date(prefill.since).toLocaleDateString('sv-SE')).toBe(
      '2026-02-01',
    );

    const res = await auth(http().post('/contract/certificate'))
      .send({
        volunteerId,
        hours: 7,
        purpose: 'Dosar de admitere',
        registrationNumber: '45/2026',
      })
      .buffer(true)
      .parse((r, done) => {
        const chunks: Buffer[] = [];
        r.on('data', (c: Buffer) => chunks.push(c));
        r.on('end', () => done(null, Buffer.concat(chunks)));
      })
      .expect(201);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toContain(
      'Adeverinta-Elena-Pop.pdf',
    );
    expect((res.body as Buffer).subarray(0, 5).toString()).toBe('%PDF-');

    await auth(http().post('/contract/certificate'))
      .send({ volunteerId, hours: -1, purpose: '', registrationNumber: '' })
      .expect(400);
    await auth(
      http().get(
        `/contract/certificate/prefill?volunteerId=${otherVolunteerId}`,
      ),
    ).expect(404);
  });

  it('stores an uploaded certificate without an end date, next to the contracts', async () => {
    await upload({
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      contractNumber: '45/2026',
    }).expect(201);
    // the same number as a contract is fine for a certificate, and its end date is ignored
    const { body } = await upload({
      type: 'CERTIFICATE',
      startDate: '2026-11-10',
      endDate: '2027-11-10',
      contractNumber: '45/2026',
    }).expect(201);
    expect(body).toMatchObject({
      type: 'CERTIFICATE',
      status: 'SIGNED',
      endDate: null,
      expiringSoon: false,
    });
    // the number keeps its "/", the file name replaces it so it can be saved on a phone (#613)
    expect(body.fileName).toMatch(/^Adeverinta_45-2026\.pdf$/);
    await upload({
      type: 'CERTIFICATE',
      startDate: '2026-11-10',
      contractNumber: '45/2026',
    }).expect(400);

    const { body: certificates } = await auth(
      http().get(`/contract?type=CERTIFICATE`),
    ).expect(200);
    expect(certificates.items.map((c: { type: string }) => c.type)).toEqual([
      'CERTIFICATE',
    ]);
    const { body: all } = await auth(
      http().get(`/contract?volunteerId=${volunteerId}`),
    ).expect(200);
    expect(all.meta.totalItems).toBe(2);
  });

  it('keeps blank contract models: upload a PDF with a name, list, delete; nothing else', async () => {
    await auth(
      http()
        .post('/template')
        .field('name', 'Model contract')
        .attach('template', Buffer.from('nu e pdf'), {
          filename: 'model.txt',
          contentType: 'text/plain',
        }),
    ).expect(400);

    const { body: created } = await auth(
      http()
        .post('/template')
        .field('name', 'Model contract')
        .attach('template', PDF, {
          filename: 'model.pdf',
          contentType: 'application/pdf',
        }),
    ).expect(201);
    expect(created).toEqual({
      id: expect.any(String),
      name: 'Model contract',
      createdOn: expect.any(String),
      uri: expect.any(String),
    });

    const { body: listed } = await auth(http().get('/template')).expect(200);
    expect(listed.map((t: { name: string }) => t.name)).toEqual([
      'Model contract',
    ]);

    await auth(http().delete(`/template/${created.id}`)).expect(200);
    expect((await auth(http().get('/template')).expect(200)).body).toEqual([]);
    await auth(http().patch(`/template/${created.id}`)).expect(404);
  });
});
