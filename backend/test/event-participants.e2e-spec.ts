import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// The event screen shows who is coming as overlapping initials: the approved count and the
// initials of the first ones to register, never names, ids or emails, and only to someone who may
// see the event at all.
describe('Mobile event participants (e2e)', () => {
  let testApp: TestApp;
  let organizationId: string;
  let eventId: string;
  let member: IAuthIdentityModel;
  let outsider: IAuthIdentityModel;
  const userIds: Record<string, string> = {};

  const detail = async (
    by: IAuthIdentityModel,
    expected: number,
  ): Promise<request.Response> =>
    request(testApp.app.getHttpServer())
      .get(`/mobile/event/${eventId}`)
      .set(
        'Authorization',
        `Bearer ${await testApp.mintAccessToken(by, AuthRealm.MOBILE)}`,
      )
      .expect(expected);

  const person = async (
    key: string,
    firstName: string,
    lastName: string,
    member = true,
  ): Promise<IAuthIdentityModel> => {
    const email = `${key}@example.ro`;
    const [user] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, first_name, last_name, email, phone)
       VALUES ('regular', $1, $2, $3, $4, '+40722000000') RETURNING id`,
      [`${firstName} ${lastName}`, firstName, lastName, email],
    );
    userIds[key] = user.id;
    if (member) {
      const [profile] = await testApp.dataSource.query(
        `INSERT INTO volunteer_profile (email) VALUES ($1) RETURNING id`,
        [email],
      );
      await testApp.dataSource.query(
        `INSERT INTO volunteer (user_id, organization_id, status, volunteer_profile_id) VALUES ($1, $2, 'active', $3)`,
        [user.id, organizationId, profile.id],
      );
    }
    return testApp.app.get(AuthIdentityFacade).createIdentity({
      realm: AuthRealm.MOBILE,
      email,
      status: AuthIdentityStatus.ACTIVE,
      userId: user.id,
    });
  };

  const register = (
    key: string,
    minutesAgo: number,
    status: string | null = 'approved',
    going = true,
  ): Promise<unknown> =>
    testApp.dataSource.query(
      `INSERT INTO event_rsvp (going, status, event_id, user_id, created_on)
       VALUES ($1, $2, $3, $4, now() - $5::interval)`,
      [going, status, eventId, userIds[key], `${minutesAgo} minutes`],
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
    organizationId = organization.id;

    // a private event: only the NGO's active volunteers may see it
    const [event] = await testApp.dataSource.query(
      `INSERT INTO event (name, description, start_date, end_date, organization_id, status, is_public)
       VALUES ('Maraton', 'd', now() + interval '1 day', now() + interval '2 days', $1, 'published', false) RETURNING id`,
      [organizationId],
    );
    eventId = event.id;

    member = await person('member', 'Ana', 'Popescu');
    outsider = await person('outsider', 'Ion', 'Străin', false);
  });

  it('sends the approved count and the initials of the first five, oldest first', async () => {
    const people: [string, string, string][] = [
      ['p1', 'ștefan', 'Țurcanu'],
      ['p2', 'Ăurelia', 'Îonescu'],
      ['p3', 'Mihai', 'Șerban'],
      ['p4', 'Ioana', 'Dobre'],
      ['p5', 'Radu', 'Lupu'],
      ['p6', 'Elena', 'Matei'],
      ['p7', 'Vlad', 'Nistor'],
    ];
    for (const [key, first, last] of people) await person(key, first, last);
    // registration order: p1 (oldest) … p7, inserted out of order on purpose
    const minutesAgo = {
      p1: 70,
      p2: 60,
      p3: 50,
      p4: 40,
      p5: 30,
      p6: 20,
      p7: 10,
    };
    for (const key of ['p4', 'p7', 'p1', 'p6', 'p3', 'p5', 'p2'])
      await register(key, minutesAgo[key as keyof typeof minutesAgo]);
    // not counted: pending, rejected, not going
    await person('pending', 'Paul', 'Pending');
    await register('pending', 80, 'pending');
    await person('rejected', 'Rita', 'Rejected');
    await register('rejected', 80, 'rejected');
    await person('declined', 'Dana', 'Declined');
    await register('declined', 80, null, false);

    const { body } = await detail(member, 200);
    expect(body.participants).toEqual({
      total: 7,
      preview: [
        { initials: 'ȘȚ' },
        { initials: 'ĂÎ' },
        { initials: 'MȘ' },
        { initials: 'ID' },
        { initials: 'RL' },
      ],
    });
    // the existing count is unchanged
    expect(body.numberOfPersonsGoingToEvent).toBe(7);

    // nothing that identifies anyone
    const sent = JSON.stringify(body.participants);
    expect(sent).not.toMatch(/example\.ro|Țurcanu|ștefan|Popescu/);
    for (const id of Object.values(userIds)) expect(sent).not.toContain(id);
    expect(
      body.participants.preview.every((p: object) => !('avatarUrl' in p)),
    ).toBe(true);

    // stable between requests
    const again = await detail(member, 200);
    expect(again.body.participants).toEqual(body.participants);
  });

  it('an event with nobody going sends an empty preview', async () => {
    const { body } = await detail(member, 200);
    expect(body.participants).toEqual({ total: 0, preview: [] });
    expect(body.numberOfPersonsGoingToEvent).toBe(0);
  });

  it('someone who may not see the event gets 404 and no participants', async () => {
    await person('p1', 'Ana', 'Pop');
    await register('p1', 10);
    const { body } = await detail(outsider, 404);
    expect(body.participants).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain('AP');
  });

  it('once the event is public, an outsider sees the same initials', async () => {
    await testApp.dataSource.query(
      `UPDATE event SET is_public = true WHERE id = $1`,
      [eventId],
    );
    await person('p1', 'Ana', 'Pop');
    await register('p1', 10);
    const { body } = await detail(outsider, 200);
    expect(body.participants).toEqual({
      total: 1,
      preview: [{ initials: 'AP' }],
    });
  });
});
