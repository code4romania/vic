import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import * as XLSX from 'xlsx';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// #508: emailed codes before sensitive actions, change email, backup and deleting the NGO.
describe('Data and security (e2e)', () => {
  let testApp: TestApp;
  let token: string;
  let organizationId: string;
  let otherOrganizationId: string;
  let adminId: string;
  let identityId: string;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = (sql: string, params: unknown[] = []): Promise<any[]> =>
    testApp.dataSource.query(sql, params);
  const count = async (sql: string, params: unknown[] = []): Promise<number> =>
    +(await q(sql, params))[0].count;

  beforeEach(async () => {
    await truncate(testApp.dataSource, [
      'actions_archive',
      'access_request',
      'access_code',
      'announcement_response',
      'announcement',
      'event_rsvp',
      'event',
      'activity_log',
      'activity_type',
      'contract',
      'auth_token',
      'auth_identity',
      'volunteer',
      'volunteer_profile',
      'organization_structure',
      'user',
      'organization',
    ]);
    [{ id: organizationId }] = await q(
      `INSERT INTO organization (name, email, phone, status, validated_at, tax_id)
       VALUES ('Crucea Verde', 'org@crucea.ro', '+40700000001', 'active', now(), '123') RETURNING id`,
    );
    [{ id: otherOrganizationId }] = await q(
      `INSERT INTO organization (name, email, phone, status, validated_at)
       VALUES ('VIC', 'echipa@vic.ro', '+40700000002', 'active', now()) RETURNING id`,
    );
    const facade = testApp.app.get(AuthIdentityFacade);
    [{ id: adminId }] = await q(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Ana Pop', 'ana@crucea.ro', '+40710000002', $1) RETURNING id`,
      [organizationId],
    );
    const identity = await facade.createIdentity({
      realm: AuthRealm.WEB,
      email: 'ana@crucea.ro',
      status: AuthIdentityStatus.ACTIVE,
      userId: adminId,
    });
    identityId = identity.id;
    token = await testApp.mintAccessToken(identity, AuthRealm.WEB);
    const [superUser] = await q(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Echipa VIC', 'super@vic.ro', '+40710000009', $1) RETURNING id`,
      [otherOrganizationId],
    );
    await facade.createIdentity({
      realm: AuthRealm.WEB,
      email: 'super@vic.ro',
      status: AuthIdentityStatus.ACTIVE,
      superAdmin: true,
      userId: superUser.id,
    });
    testApp.mailbox.clear();
  });

  const http = (): ReturnType<typeof request> =>
    request(testApp.app.getHttpServer());
  const post = (path: string, body: object): request.Test =>
    http().post(path).set('Authorization', `Bearer ${token}`).send(body);
  const code = async (action: string): Promise<string> => {
    const { body } = await post('/security/code', { action }).expect(200);
    expect(body).toEqual({ maskedEmail: 'a•••@crucea.ro' });
    return testApp.mailbox.last('ana@crucea.ro').context.code;
  };

  it('adding an admin needs the emailed code, and a code works once', async () => {
    const admin = {
      firstName: 'Bogdan',
      lastName: 'Ionescu',
      email: 'bogdan@crucea.ro',
      phone: '+40722222222',
    };
    expect(
      (
        await post('/organization/team', { ...admin, code: '000000' }).expect(
          400,
        )
      ).body.code_error,
    ).toBe('AUTH_005');
    await post('/organization/team', admin).expect(400);

    const good = await code('ADD_ADMIN');
    expect(testApp.mailbox.last('ana@crucea.ro').subject).toContain(good);
    await post('/organization/team', { ...admin, code: good }).expect(201);
    await post('/organization/team', {
      ...admin,
      email: 'altul@crucea.ro',
      code: good,
    }).expect(400);
  });

  it('changes the email with a code to the old address and one to the new one', async () => {
    await post('/security/email/codes', { newEmail: 'super@vic.ro' }).expect(
      409,
    );
    const { body } = await post('/security/email/codes', {
      newEmail: ' Ana.Noua@Crucea.ro ',
    }).expect(200);
    expect(body).toEqual({
      maskedEmail: 'a•••@crucea.ro',
      newEmail: 'ana.noua@crucea.ro',
    });
    const oldCode = testApp.mailbox.last('ana@crucea.ro').context.code;
    const newCode = testApp.mailbox.last('ana.noua@crucea.ro').context.code;
    expect(oldCode).not.toBe(newCode);

    await post('/security/email', {
      code: oldCode,
      newEmailCode: '000000',
    }).expect(400);
    const { body: changed } = await post('/security/email', {
      code: oldCode,
      newEmailCode: newCode,
    }).expect(200);
    expect(changed).toEqual({ email: 'ana.noua@crucea.ro' });

    const [user] = await q(`SELECT email FROM "user" WHERE id = $1`, [adminId]);
    const [identity] = await q(
      `SELECT email FROM auth_identity WHERE id = $1`,
      [identityId],
    );
    expect([user.email, identity.email]).toEqual([
      'ana.noua@crucea.ro',
      'ana.noua@crucea.ro',
    ]);
    expect(testApp.mailbox.last('ana@crucea.ro').subject).toContain(
      'a fost schimbat',
    );
  });

  it('downloads a full backup as an Excel workbook', async () => {
    const [user] = await q(
      `INSERT INTO "user" (type, name, email, phone) VALUES ('regular', 'Elena Pop', 'elena@example.ro', '+40720000001') RETURNING id`,
    );
    await q(
      `INSERT INTO volunteer (user_id, organization_id, status) VALUES ($1, $2, 'active')`,
      [user.id, organizationId],
    );
    // #593: the backup needs the emailed code too
    expect(
      (
        await http()
          .get('/security/backup')
          .set('Authorization', `Bearer ${token}`)
          .expect(400)
      ).body.code_error,
    ).toBe('AUTH_005');

    const res = await http()
      .get('/security/backup')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Sensitive-Code', await code('BACKUP'))
      .buffer(true)
      .parse((r, done) => {
        const chunks: Buffer[] = [];
        r.on('data', (c: Buffer) => chunks.push(c));
        r.on('end', () => done(null, Buffer.concat(chunks)));
      })
      .expect(200);
    expect(res.headers['content-disposition']).toMatch(/VIC-backup-.+\.xlsx/);
    const workbook = XLSX.read(res.body as Buffer);
    expect(workbook.SheetNames).toEqual(
      expect.arrayContaining(['Organizație', 'Voluntari', 'Ore', 'Documente']),
    );
    const volunteers = XLSX.utils.sheet_to_json<Record<string, string>>(
      workbook.Sheets['Voluntari'],
    );
    expect(volunteers).toEqual([
      expect.objectContaining({ Nume: 'Elena Pop', Status: 'active' }),
    ]);
  });

  // #593: the volunteers export carries personal data; it needs the emailed code, used once
  it('exports the volunteers only with a valid emailed code', async () => {
    const download = (sensitiveCode?: string): request.Test => {
      const req = http()
        .get('/volunteer/download')
        .set('Authorization', `Bearer ${token}`);
      return sensitiveCode ? req.set('X-Sensitive-Code', sensitiveCode) : req;
    };

    expect((await download().expect(400)).body.code_error).toBe('AUTH_005');
    const valid = await code('EXPORT_VOLUNTEERS');
    expect(testApp.mailbox.last('ana@crucea.ro').subject).toBeTruthy();
    await download('000000').expect(400);
    const res = await download(valid).expect(200);
    expect(res.headers['content-disposition']).toContain('Voluntari.xlsx');
    // a code works once
    await download(valid).expect(400);
  });

  it('deletes the organization and all its data after the typed name and the code', async () => {
    const [user] = await q(
      `INSERT INTO "user" (type, name, email, phone, active_organization_id)
       VALUES ('regular', 'Elena Pop', 'elena@example.ro', '+40720000001', $1) RETURNING id`,
      [organizationId],
    );
    const [profile] = await q(
      `INSERT INTO volunteer_profile (email) VALUES ('elena@crucea.ro') RETURNING id`,
    );
    const [volunteer] = await q(
      `INSERT INTO volunteer (user_id, organization_id, status, volunteer_profile_id)
       VALUES ($1, $2, 'active', $3) RETURNING id`,
      [user.id, organizationId, profile.id],
    );
    await q(
      `INSERT INTO volunteer (user_id, organization_id, status) VALUES ($1, $2, 'active')`,
      [user.id, otherOrganizationId],
    );
    const [structure] = await q(
      `INSERT INTO organization_structure (type, name, organization_id, created_by)
       VALUES ('department', 'Logistică', $1, $2) RETURNING id`,
      [organizationId, adminId],
    );
    const [event] = await q(
      `INSERT INTO event (name, description, start_date, organization_id)
       VALUES ('Curățenie', '-', now(), $1) RETURNING id`,
      [organizationId],
    );
    await q(
      `INSERT INTO event_targets_organization_structure ("eventId", "organizationStructureId") VALUES ($1, $2)`,
      [event.id, structure.id],
    );
    await q(
      `INSERT INTO event_rsvp (going, event_id, user_id, status, decided_by)
       VALUES (true, $1, $2, 'approved', $3)`,
      [event.id, user.id, adminId],
    );
    const [type] = await q(
      `INSERT INTO activity_type (name, icon, organization_id) VALUES ('Sortare', 'x', $1) RETURNING id`,
      [organizationId],
    );
    await q(
      `INSERT INTO activity_log (date, hours, status, volunteer_id, organization_id, event_id, activity_type_id, approved_by)
       VALUES (now(), 4, 'approved', $1, $2, $3, $4, $5)`,
      [volunteer.id, organizationId, event.id, type.id, adminId],
    );
    await q(
      `INSERT INTO contract (path, start_date, status, organization_id, volunteer_id, created_by_admin_id)
       VALUES ('contracts/x.pdf', now(), 'ACTIVE', $1, $2, $3)`,
      [organizationId, volunteer.id, adminId],
    );
    const [announcement] = await q(
      `INSERT INTO announcement (name, description, status, organization_id, display_start_date)
       VALUES ('Anunț', '-', 'active', $1, now()) RETURNING id`,
      [organizationId],
    );
    await q(
      `INSERT INTO announcement_response (comment, announcement_id, user_id, volunteer_id)
       VALUES ('Vin', $1, $2, $3)`,
      [announcement.id, user.id, volunteer.id],
    );
    await q(
      `INSERT INTO access_request (answers, requested_by, organization_id, updated_by)
       VALUES ('[]', $1, $2, $3)`,
      [user.id, organizationId, adminId],
    );
    await q(
      `INSERT INTO access_code (code, start_date, organization_id, created_by)
       VALUES ('COD123', now(), $1, $2)`,
      [organizationId, adminId],
    );

    const good = await code('DELETE_ORGANIZATION');
    expect(
      (
        await post('/security/organization/delete', {
          confirmation: 'Crucea Rosie',
          code: good,
        }).expect(400)
      ).body.code_error,
    ).toBe('ORG_011');
    expect(await count(`SELECT count(*) FROM organization`)).toBe(2);

    await post('/security/organization/delete', {
      confirmation: '  crucea   verde ',
      code: good,
    }).expect(204);

    expect(
      await count(`SELECT count(*) FROM organization WHERE id = $1`, [
        organizationId,
      ]),
    ).toBe(0);
    for (const table of [
      'activity_log',
      'contract',
      'event',
      'event_rsvp',
      'announcement',
      'announcement_response',
      'access_request',
      'access_code',
      'activity_type',
      'organization_structure',
      'volunteer_profile',
    ]) {
      expect([table, await count(`SELECT count(*) FROM ${table}`)]).toEqual([
        table,
        0,
      ]);
    }
    // the volunteer keeps their account and the other NGO, which becomes the active one
    const [left] = await q(
      `SELECT active_organization_id FROM "user" WHERE id = $1`,
      [user.id],
    );
    expect(left.active_organization_id).toBe(otherOrganizationId);
    expect(await count(`SELECT count(*) FROM volunteer`)).toBe(1);
    // the admins and their logins are gone; the VIC team was told
    expect(
      await count(`SELECT count(*) FROM "user" WHERE id = $1`, [adminId]),
    ).toBe(0);
    expect(
      await count(`SELECT count(*) FROM auth_identity WHERE id = $1`, [
        identityId,
      ]),
    ).toBe(0);
    expect(testApp.mailbox.last('super@vic.ro').subject).toContain(
      'Crucea Verde',
    );
  });
});
