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

type Registration = {
  id: string;
  status: string;
  rejectionReason: string | null;
  decidedByName: string | null;
  event: { id: string; name: string };
  user: { name: string };
  volunteerStatus: string | null;
};

// #501: "going" is a registration the NGO approves or rejects (with a reason). Volunteers of the
// organization from the event's departments are approved automatically.
describe('Event registrations (e2e)', () => {
  let testApp: TestApp;
  let admin: IAuthIdentityModel;
  let eventId: string;
  const people: Record<string, IAuthIdentityModel> = {};

  const http = (): request.SuperTest<request.Test> =>
    request(
      testApp.app.getHttpServer(),
    ) as unknown as request.SuperTest<request.Test>;

  const adminToken = (): Promise<string> =>
    testApp.mintAccessToken(admin, AuthRealm.WEB);

  const rsvp = async (name: string, going: boolean): Promise<void> => {
    const token = await testApp.mintAccessToken(people[name], AuthRealm.MOBILE);
    await http()
      .patch(`/mobile/event/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${token}`)
      .send({ going })
      .expect(200);
  };

  const mobileEvent = async (
    name: string,
  ): Promise<Record<string, unknown>> => {
    const token = await testApp.mintAccessToken(people[name], AuthRealm.MOBILE);
    const response = await http()
      .get(`/mobile/event/${eventId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    return response.body;
  };

  const list = async (status?: string): Promise<Registration[]> => {
    const response = await http()
      .get('/event-registrations')
      .query(status ? { status } : {})
      .set('Authorization', `Bearer ${await adminToken()}`)
      .expect(200);
    return response.body.items as Registration[];
  };

  const idOf = async (name: string): Promise<string> => {
    const [row] = await testApp.dataSource.query(
      `SELECT r.id FROM event_rsvp r JOIN "user" u ON u.id = r.user_id WHERE u.name = $1`,
      [name],
    );
    return row.id;
  };

  const decide = async (
    name: string,
    action: 'approve' | 'reject',
    status: number,
    body?: object,
  ): Promise<request.Response> =>
    http()
      .patch(`/event-registrations/${await idOf(name)}/${action}`)
      .set('Authorization', `Bearer ${await adminToken()}`)
      .send(body ?? {})
      .expect(status);

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  beforeEach(async () => {
    await truncate(testApp.dataSource, [
      'auth_identity',
      'event_rsvp',
      'event_targets_organization_structure',
      'event',
      'volunteer',
      'volunteer_profile',
      'organization_structure',
      'user',
      'organization',
    ]);
    const [organization] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone, status, validated_at) VALUES ('Org', 'org@example.ro', '+40700000000', 'active', now()) RETURNING id`,
    );
    const organizationId = organization.id;
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

    const department = async (name: string): Promise<string> => {
      const [row] = await testApp.dataSource.query(
        `INSERT INTO organization_structure (name, type, organization_id, created_by) VALUES ($1, 'department', $2, $3) RETURNING id`,
        [name, organizationId, adminUser.id],
      );
      return row.id;
    };
    const logistica = await department('Logistică');
    const comunicare = await department('Comunicare');

    const person = async (
      name: string,
      departmentId?: string,
    ): Promise<void> => {
      const email = `${name.toLowerCase()}@example.ro`;
      const [user] = await testApp.dataSource.query(
        `INSERT INTO "user" (type, name, email, phone) VALUES ('regular', $1, $2, '+40722000000') RETURNING id`,
        [name, email],
      );
      if (departmentId) {
        const [profile] = await testApp.dataSource.query(
          `INSERT INTO volunteer_profile (email, department_id) VALUES ($1, $2) RETURNING id`,
          [email, departmentId],
        );
        await testApp.dataSource.query(
          `INSERT INTO volunteer (user_id, organization_id, status, volunteer_profile_id) VALUES ($1, $2, 'active', $3)`,
          [user.id, organizationId, profile.id],
        );
      }
      people[name] = await testApp.app.get(AuthIdentityFacade).createIdentity({
        realm: AuthRealm.MOBILE,
        email,
        status: AuthIdentityStatus.ACTIVE,
        userId: user.id,
      });
    };
    await person('Bogdan', logistica);
    await person('Cristi', comunicare);
    // not a volunteer of the organization: the event is public
    await person('Ion');

    const [event] = await testApp.dataSource.query(
      `INSERT INTO event (name, description, start_date, end_date, organization_id, status, capacity, is_public)
       VALUES ('Maraton', 'd', now() + interval '1 day', now() + interval '2 days', $1, 'published', 2, true) RETURNING id`,
      [organizationId],
    );
    eventId = event.id;
    await testApp.dataSource.query(
      `INSERT INTO event_targets_organization_structure ("eventId", "organizationStructureId") VALUES ($1, $2)`,
      [eventId, logistica],
    );
  });

  it("approves volunteers from the event's departments automatically; the rest wait", async () => {
    await rsvp('Bogdan', true);
    await rsvp('Cristi', true);
    await rsvp('Ion', true);

    expect((await list()).map((r) => [r.user.name, r.volunteerStatus])).toEqual(
      expect.arrayContaining([
        ['Cristi', 'active'],
        ['Ion', null],
      ]),
    );
    expect((await list()).length).toBe(2);
    expect((await list('approved')).map((r) => r.user.name)).toEqual([
      'Bogdan',
    ]);

    expect(await mobileEvent('Cristi')).toMatchObject({
      volunteerStatus: 'JOINED',
      registrationStatus: 'pending',
      numberOfPersonsGoingToEvent: 1,
    });
    expect(await mobileEvent('Bogdan')).toMatchObject({
      registrationStatus: 'approved',
    });
  });

  it('rejects with a reason only, and the decision can be changed', async () => {
    await rsvp('Cristi', true);

    await decide('Cristi', 'reject', 400, { reason: '  ' });
    await decide('Cristi', 'reject', 400);
    expect((await list()).map((r) => r.user.name)).toEqual(['Cristi']);

    await decide('Cristi', 'reject', 200, { reason: 'Doar pentru Logistică' });
    const [rejected] = await list('rejected');
    expect(rejected).toMatchObject({
      status: 'rejected',
      rejectionReason: 'Doar pentru Logistică',
      decidedByName: 'Ana Admin',
    });
    expect(await mobileEvent('Cristi')).toMatchObject({
      registrationStatus: 'rejected',
      rejectionReason: 'Doar pentru Logistică',
      numberOfPersonsGoingToEvent: 0,
    });

    await decide('Cristi', 'approve', 200);
    expect((await list('approved')).map((r) => r.user.name)).toEqual([
      'Cristi',
    ]);
    expect(await list('rejected')).toEqual([]);
    expect(await mobileEvent('Cristi')).toMatchObject({
      registrationStatus: 'approved',
      rejectionReason: null,
      numberOfPersonsGoingToEvent: 1,
    });
  });

  it('the "going" answers list and its export leave out rejected registrations', async () => {
    await rsvp('Bogdan', true);
    await rsvp('Cristi', true);
    await decide('Cristi', 'reject', 200, { reason: 'Nu' });

    const going = await http()
      .get(`/event/${eventId}/rsvp`)
      .query({ going: 'yes' })
      .set('Authorization', `Bearer ${await adminToken()}`)
      .expect(200);
    expect(
      going.body.items.map((r: { userName: string }) => r.userName),
    ).toEqual(['Bogdan']);

    const file = await http()
      .get(`/event/${eventId}/rsvp/download`)
      .query({ going: 'yes' })
      .set('Authorization', `Bearer ${await adminToken()}`)
      .buffer(true)
      .parse((res, done) => {
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => done(null, Buffer.concat(chunks)));
      })
      .expect(200);
    const book = XLSX.read(file.body, { type: 'buffer' });
    const rows = XLSX.utils.sheet_to_json<{ Nume: string }>(
      book.Sheets[book.SheetNames[0]],
    );
    expect(rows.map((r) => r.Nume)).toEqual(['Bogdan']);
  });

  it('respects the capacity when approving: 400 EVENT_RSVP_008', async () => {
    await rsvp('Bogdan', true);
    await rsvp('Cristi', true);
    await rsvp('Ion', true);
    await decide('Cristi', 'approve', 200);

    const response = await decide('Ion', 'approve', 400);
    expect(response.body.code_error).toBe('EVENT_RSVP_008');
  });

  it('a "not going" answer has no decision to make', async () => {
    await rsvp('Cristi', true);
    await decide('Cristi', 'reject', 200, { reason: 'Nu' });
    await rsvp('Cristi', false);

    expect(await list('rejected')).toEqual([]);
    const response = await decide('Cristi', 'approve', 404);
    expect(response.body.code_error).toBe('EVENT_RSVP_010');

    // going again: back to the NGO's decision
    await rsvp('Cristi', true);
    expect((await list()).map((r) => r.user.name)).toEqual(['Cristi']);
  });

  it("does not show or decide another organization's registrations", async () => {
    await rsvp('Cristi', true);
    const [other] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone, status, validated_at) VALUES ('Alt ONG', 'alt@example.ro', '+40700000001', 'active', now()) RETURNING id`,
    );
    await testApp.dataSource.query(
      `UPDATE "user" SET organization_id = $1 WHERE email = 'admin@example.ro'`,
      [other.id],
    );

    expect(await list()).toEqual([]);
    const response = await decide('Cristi', 'approve', 404);
    expect(response.body.code_error).toBe('EVENT_RSVP_010');
  });
});
