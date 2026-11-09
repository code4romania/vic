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

type Candidate = {
  volunteerId: string;
  name: string;
  department: string | null;
  totalHours: number;
  registered: boolean;
};

// #496: the NGO adds volunteers from the event's departments to an event directly.
describe('Add volunteers to an event (e2e)', () => {
  let testApp: TestApp;
  let admin: IAuthIdentityModel;
  let organizationId: string;
  let eventId: string;
  const volunteers: Record<string, string> = {};

  const http = (): request.SuperTest<request.Test> =>
    request(
      testApp.app.getHttpServer(),
    ) as unknown as request.SuperTest<request.Test>;

  const token = (): Promise<string> =>
    testApp.mintAccessToken(admin, AuthRealm.WEB);

  const candidates = async (search?: string): Promise<Candidate[]> => {
    const response = await http()
      .get(`/event/${eventId}/candidates`)
      .query(search ? { search } : {})
      .set('Authorization', `Bearer ${await token()}`)
      .expect(200);
    return response.body.items as Candidate[];
  };

  const add = async (
    names: string[],
    status: number,
  ): Promise<request.Response> =>
    http()
      .post(`/event/${eventId}/volunteers`)
      .set('Authorization', `Bearer ${await token()}`)
      .send({ volunteerIds: names.map((name) => volunteers[name]) })
      .expect(status);

  const going = async (): Promise<string[]> =>
    (
      await testApp.dataSource.query(
        `SELECT u.name FROM event_rsvp r JOIN "user" u ON u.id = r.user_id WHERE r.event_id = $1 AND r.going ORDER BY u.name`,
        [eventId],
      )
    ).map((row: { name: string }) => row.name);

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
      'activity_log',
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
    organizationId = organization.id;
    const [adminUser] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Ana Admin', 'ana@example.ro', '+40711111111', $1) RETURNING id`,
      [organizationId],
    );
    admin = await testApp.app.get(AuthIdentityFacade).createIdentity({
      realm: AuthRealm.WEB,
      email: 'ana@example.ro',
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

    const volunteer = async (
      name: string,
      status: string,
      departmentId: string,
    ): Promise<void> => {
      const email = `${name.toLowerCase()}@example.ro`;
      const [user] = await testApp.dataSource.query(
        `INSERT INTO "user" (type, name, email, phone) VALUES ('regular', $1, $2, '+40722000000') RETURNING id`,
        [name, email],
      );
      const [profile] = await testApp.dataSource.query(
        `INSERT INTO volunteer_profile (email, department_id) VALUES ($1, $2) RETURNING id`,
        [email, departmentId],
      );
      const [row] = await testApp.dataSource.query(
        `INSERT INTO volunteer (user_id, organization_id, status, volunteer_profile_id) VALUES ($1, $2, $3, $4) RETURNING id`,
        [user.id, organizationId, status, profile.id],
      );
      volunteers[name] = row.id;
    };
    await volunteer('Ana', 'active', logistica);
    await volunteer('Bogdan', 'active', logistica);
    await volunteer('Elena', 'active', logistica);
    await volunteer('Cristi', 'active', comunicare);
    await volunteer('Dan', 'inactive', logistica);

    const [event] = await testApp.dataSource.query(
      `INSERT INTO event (name, description, start_date, end_date, organization_id, status, capacity)
       VALUES ('Maraton', 'd', now() + interval '1 day', now() + interval '2 days', $1, 'published', 2) RETURNING id`,
      [organizationId],
    );
    eventId = event.id;
    await testApp.dataSource.query(
      `INSERT INTO event_targets_organization_structure ("eventId", "organizationStructureId") VALUES ($1, $2)`,
      [eventId, logistica],
    );

    await testApp.dataSource.query(
      `INSERT INTO activity_log (date, hours, status, volunteer_id, organization_id) VALUES
         (now(), 5, 'approved', $1, $2), (now(), 3, 'approved', $1, $2), (now(), 9, 'pending', $1, $2)`,
      [volunteers['Ana'], organizationId],
    );
    // Elena already said she is going
    await testApp.dataSource.query(
      `INSERT INTO event_rsvp (going, event_id, user_id) SELECT true, $1, user_id FROM volunteer WHERE id = $2`,
      [eventId, volunteers['Elena']],
    );
  });

  it("lists the active volunteers of the event's departments, with their approved hours", async () => {
    const list = await candidates();
    expect(
      list.map((c) => [c.name, c.department, c.totalHours, c.registered]),
    ).toEqual([
      ['Ana', 'Logistică', 8, false],
      ['Bogdan', 'Logistică', 0, false],
      ['Elena', 'Logistică', 0, true],
    ]);
    expect((await candidates('bog')).map((c) => c.name)).toEqual(['Bogdan']);

    const response = await http()
      .get(`/event/${eventId}/candidates`)
      .set('Authorization', `Bearer ${await token()}`)
      .expect(200);
    // capacity 2, Elena is going
    expect(response.body.placesLeft).toBe(1);
  });

  it('registers them right away', async () => {
    const response = await add(['Ana'], 201);
    expect(response.body).toMatchObject([{ name: 'Ana', registered: true }]);
    expect(await going()).toEqual(['Ana', 'Elena']);
  });

  it('respects the capacity: 400 EVENT_RSVP_008 and nobody is added', async () => {
    const response = await add(['Ana', 'Bogdan'], 400);
    expect(response.body.code_error).toBe('EVENT_RSVP_008');
    expect(await going()).toEqual(['Elena']);
  });

  it('refuses volunteers from other departments or not active: 400 EVENT_RSVP_009', async () => {
    for (const name of ['Cristi', 'Dan']) {
      const response = await add([name], 400);
      expect(response.body.code_error).toBe('EVENT_RSVP_009');
    }
    expect(await going()).toEqual(['Elena']);
  });

  it('lists every department when the event targets all of them', async () => {
    await testApp.dataSource.query(
      `DELETE FROM event_targets_organization_structure WHERE "eventId" = $1`,
      [eventId],
    );
    expect((await candidates()).map((c) => c.name)).toEqual([
      'Ana',
      'Bogdan',
      'Cristi',
      'Elena',
    ]);
  });

  // #497: export of the registered volunteers with the chosen columns
  describe('export of registered volunteers', () => {
    const download = async (fields?: string): Promise<unknown[][]> => {
      const response = await http()
        .get(`/event/${eventId}/registrations/download`)
        .query(fields ? { fields } : {})
        .set('Authorization', `Bearer ${await token()}`)
        .buffer(true)
        .parse((res, callback) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => callback(null, Buffer.concat(chunks)));
        })
        .expect(200);
      const workbook = XLSX.read(response.body, { type: 'buffer' });
      return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
        header: 1,
      });
    };

    it('exports only the chosen columns, in a fixed order, for the people going', async () => {
      await add(['Ana'], 201);
      // someone who said "not going" is not exported
      await testApp.dataSource.query(
        `INSERT INTO event_rsvp (going, event_id, user_id) SELECT false, $1, user_id FROM volunteer WHERE id = $2`,
        [eventId, volunteers['Bogdan']],
      );

      expect(await download('hours,name')).toEqual([
        ['Nume', 'Ore aprobate in organizatie'],
        ['Ana', 8],
        ['Elena', 0],
      ]);

      const [header, first] = await download();
      expect(header).toEqual([
        'Nume',
        'Email',
        'Telefon',
        'Departament',
        'Filiala',
        'Rol',
        'Ore aprobate in organizatie',
        'Data inscrierii',
      ]);
      expect(first.slice(0, 4)).toEqual([
        'Ana',
        'ana@example.ro',
        '+40722000000',
        'Logistică',
      ]);
    });

    it('refuses an unknown column', async () => {
      await http()
        .get(`/event/${eventId}/registrations/download`)
        .query({ fields: 'name,password' })
        .set('Authorization', `Bearer ${await token()}`)
        .expect(400);
    });
  });
});
