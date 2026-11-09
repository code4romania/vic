import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import * as XLSX from 'xlsx';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// #473: the NGO imports volunteers from a CSV; valid rows become Candidates, invalid rows are reported.
describe('Import volunteers (e2e)', () => {
  let testApp: TestApp;
  let admin: IAuthIdentityModel;
  let organizationId: string;
  let cityId: number;

  const http = (): request.SuperTest<request.Test> =>
    request(
      testApp.app.getHttpServer(),
    ) as unknown as request.SuperTest<request.Test>;

  const upload = async (
    content: string | Buffer,
    status: number,
    filename = 'voluntari.csv',
  ): Promise<request.Response> =>
    http()
      .post('/volunteer/import')
      .set(
        'Authorization',
        `Bearer ${await testApp.mintAccessToken(admin, AuthRealm.WEB)}`,
      )
      .attach(
        'file',
        typeof content === 'string' ? Buffer.from(content, 'utf8') : content,
        { filename },
      )
      .expect(status);

  const volunteers = async (): Promise<Record<string, unknown>[]> =>
    testApp.dataSource.query(
      `SELECT u.email, u.has_account, u.location_id, v.status, v.source, s.name AS department
       FROM volunteer v JOIN "user" u ON u.id = v.user_id
       LEFT JOIN volunteer_profile p ON p.id = v.volunteer_profile_id
       LEFT JOIN organization_structure s ON s.id = p.department_id
       WHERE v.organization_id = $1 ORDER BY u.email`,
      [organizationId],
    );

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  beforeEach(async () => {
    await truncate(testApp.dataSource, [
      'auth_identity',
      'volunteer',
      'volunteer_profile',
      'organization_structure',
      'user',
      'organization',
      '_city',
      '_county',
    ]);
    testApp.mailbox.clear();
    await testApp.dataSource.query(
      `INSERT INTO _county (id, name, abbreviation) VALUES (1, 'Cluj', 'CJ'), (2, 'Alba', 'AB')`,
    );
    await testApp.dataSource.query(
      `INSERT INTO _city (id, name, county_id) VALUES (10, 'Cluj-Napoca', 1), (11, 'Valea Lungă', 1), (20, 'Valea Lungă', 2)`,
    );
    cityId = 10;
    const [organization] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone, status, validated_at) VALUES ('Org', 'org@example.ro', '+40700000000', 'active', now()) RETURNING id`,
    );
    organizationId = organization.id;
    const [adminUser] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Ana Admin', 'admin@example.ro', '+40711111111', $1) RETURNING id`,
      [organizationId],
    );
    admin = await testApp.app.get(AuthIdentityFacade).createIdentity({
      realm: AuthRealm.WEB,
      email: 'admin@example.ro',
      status: AuthIdentityStatus.ACTIVE,
      userId: adminUser.id,
    });
    await testApp.dataSource.query(
      `INSERT INTO organization_structure (name, type, organization_id, created_by) VALUES ('Logistică', 'department', $1, $2)`,
      [organizationId, adminUser.id],
    );
    // Someone who already has a VIC account
    await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, first_name, last_name, email, has_account) VALUES ('regular', 'Ion Cont', 'Ion', 'Cont', 'ion@example.ro', true)`,
    );
  });

  it('imports valid rows as Candidates, reports invalid rows by number, sends no email', async () => {
    const csv = [
      '﻿Prenume,Nume,Email,Telefon,Localitate,Județ,Departament',
      'Maria,Ionescu,Maria@Example.ro,+40722000001,Cluj-Napoca,Cluj,logistica',
      'Ion,Cont,ion@example.ro,,,,',
      'X,Popa,popa@example.ro,,,,',
      'Dan,Pop,not-an-email,,Orasul Nimanui,Cluj,Marketing',
      ',,,,,,',
      '"Ana, Maria",Vasile,maria@example.ro,,,,',
      'Ana,Pop,ana@example.ro,,Valea Lunga,,',
      'Ana,Pop,ana@example.ro,,valea lungă,AB,',
    ].join('\n');

    const { body } = await upload(csv, 201);

    expect(body).toEqual({
      imported: 3,
      skipped: [
        { row: 7, email: 'maria@example.ro', reason: 'duplicate_in_file' },
      ],
      errors: [
        { row: 4, reasons: ['first_name'] },
        {
          row: 5,
          reasons: ['email', 'city_not_found', 'department_not_found'],
        },
        { row: 8, reasons: ['city_ambiguous'] },
      ],
    });
    const rows = await volunteers();
    expect(rows).toEqual([
      {
        email: 'ana@example.ro',
        has_account: false,
        location_id: 20,
        status: 'candidate',
        source: 'Import CSV',
        department: null,
      },
      {
        email: 'ion@example.ro',
        has_account: true,
        location_id: null,
        status: 'candidate',
        source: 'Import CSV',
        department: null,
      },
      {
        email: 'maria@example.ro',
        has_account: false,
        location_id: cityId,
        status: 'candidate',
        source: 'Import CSV',
        department: 'Logistică',
      },
    ]);
    expect(testApp.mailbox.sent).toHaveLength(0);
  });

  it('re-importing the same emails creates no duplicates', async () => {
    const csv = 'prenume,nume,email\nMaria,Ionescu,maria@example.ro\n';
    expect((await upload(csv, 201)).body.imported).toBe(1);

    const again = await upload(csv, 201);
    expect(again.body).toEqual({
      imported: 0,
      skipped: [
        { row: 2, email: 'maria@example.ro', reason: 'already_volunteer' },
      ],
      errors: [],
    });
    expect(await volunteers()).toHaveLength(1);
    const [{ count }] = await testApp.dataSource.query(
      `SELECT count(*)::int AS count FROM "user" WHERE email = 'maria@example.ro'`,
    );
    expect(count).toBe(1);
  });

  it('reads an Excel file with the same columns', async () => {
    const sheet = XLSX.utils.aoa_to_sheet([
      ['Prenume', 'Nume', 'Email'],
      ['Elena', 'Radu', 'elena@example.ro'],
    ]);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Voluntari');
    const buffer = XLSX.write(book, { type: 'buffer', bookType: 'xlsx' });

    const { body } = await upload(buffer, 201, 'voluntari.xlsx');
    expect(body.imported).toBe(1);
  });

  it('refuses a file without the required columns or with no rows (VOLUNTEER_010)', async () => {
    expect(
      (await upload('nume,telefon\nIonescu,0722\n', 400)).body.code_error,
    ).toBe('VOLUNTEER_010');
    expect((await upload('', 400)).body.code_error).toBe('VOLUNTEER_010');
  });
});
