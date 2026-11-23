import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { FinishOldAccountDeletionsUseCase } from 'src/usecases/user/finish-old-account-deletions.usecase';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// #687: accounts deleted with the 2023 code could stop half way: an account-deleted@… profile email,
// but the real name and an active volunteer record the NGO still listed.
describe('Finish old account deletions (e2e)', () => {
  let testApp: TestApp;
  let adminToken: string;
  let organizationId: string;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = (sql: string, params: unknown[] = []): Promise<any[]> =>
    testApp.dataSource.query(sql, params);

  const volunteer = async (
    name: string,
    userEmail: string,
    profileEmail: string | null,
  ): Promise<{ userId: string; volunteerId: string }> => {
    const [first, last] = name.split(' ');
    const [user] = await q(
      `INSERT INTO "user" (type, name, first_name, last_name, email, phone, has_account)
       VALUES ('regular', $1, $2, $3, $4, '+40720000001', true) RETURNING id`,
      [name, first, last, userEmail],
    );
    const profile = profileEmail
      ? (
          await q(
            `INSERT INTO volunteer_profile (email) VALUES ($1) RETURNING id`,
            [profileEmail],
          )
        )[0].id
      : null;
    const [v] = await q(
      `INSERT INTO volunteer (user_id, organization_id, status, volunteer_profile_id)
       VALUES ($1, $2, 'active', $3) RETURNING id`,
      [user.id, organizationId, profile],
    );
    await q(
      `INSERT INTO activity_log (date, hours, status, volunteer_id, organization_id)
       VALUES (now(), 3, 'approved', $1, $2)`,
      [v.id, organizationId],
    );
    return { userId: user.id, volunteerId: v.id };
  };

  const listedNames = async (): Promise<string[]> =>
    (
      await request(testApp.app.getHttpServer())
        .get('/volunteer')
        .query({ limit: 50, page: 1 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
    ).body.items
      .map((item: { user: { name: string } }) => item.user.name)
      .sort();

  beforeEach(async () => {
    await truncate(testApp.dataSource, [
      'activity_log',
      'contract',
      'auth_identity',
      'volunteer',
      'volunteer_profile',
      'user',
      'organization',
    ]);
    [{ id: organizationId }] = await q(
      `INSERT INTO organization (name, email, phone, status, validated_at)
       VALUES ('Crucea Verde', 'org@crucea.ro', '+40700000001', 'active', now()) RETURNING id`,
    );
    const [admin] = await q(
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
  });

  it('lists the unfinished deletions, then erases them like a deletion today', async () => {
    // the state seen on staging: anonymized profile email, real name, active volunteer
    const half = await volunteer(
      'Louis Panera',
      'louis@example.ro',
      'account-deleted@1702900000000.ro',
    );
    // the old anonymization of the user itself, with the volunteer record left behind
    const old = await volunteer(
      'Deleted Deleted',
      'account-deleted@1702900000001.ro',
      null,
    );
    // a volunteer who never asked for anything
    const kept = await volunteer(
      'Elena Pop',
      'elena@example.ro',
      'elena@ong.ro',
    );
    const useCase = testApp.app.get(FinishOldAccountDeletionsUseCase);

    expect(await listedNames()).toEqual([
      'Deleted Deleted',
      'Elena Pop',
      'Louis Panera',
    ]);

    // without --apply nothing changes
    const dry = await useCase.execute(false);
    expect(
      dry.found.map(({ userId, reason, volunteers }) => [
        userId,
        reason,
        volunteers,
      ]),
    ).toEqual(
      expect.arrayContaining([
        [half.userId, 'anonymized_profile', 1],
        [old.userId, 'anonymized_user', 1],
      ]),
    );
    expect(dry.found).toHaveLength(2);
    expect(dry.erased).toEqual([]);
    expect(await listedNames()).toHaveLength(3);

    const applied = await useCase.execute(true);
    expect(applied.erased.sort()).toEqual([half.userId, old.userId].sort());
    expect(applied.failed).toEqual([]);

    // the NGO lists only the volunteer who stayed, with their hours
    expect(await listedNames()).toEqual(['Elena Pop']);
    const [{ count: logs }] = await q(
      `SELECT count(*)::int AS count FROM activity_log WHERE volunteer_id = ANY($1::uuid[])`,
      [[half.volunteerId, old.volunteerId]],
    );
    expect(logs).toBe(0);
    const [louis] = await q(
      `SELECT name, email, phone, deleted_on FROM "user" WHERE id = $1`,
      [half.userId],
    );
    expect(louis.name).toBe('Cont șters');
    expect(louis.email).toBe(`deleted-${half.userId}@deleted.invalid`);
    expect(louis.phone).toBeNull();
    expect(louis.deleted_on).not.toBeNull();
    const [elena] = await q(`SELECT name FROM "user" WHERE id = $1`, [
      kept.userId,
    ]);
    expect(elena.name).toBe('Elena Pop');

    // nothing left to do the second time
    expect((await useCase.execute(true)).found).toEqual([]);
  });

  it('--only-profiles finishes the half-finished deletions and leaves the old anonymized accounts', async () => {
    const half = await volunteer(
      'Louis Panera',
      'louis@example.ro',
      'account-deleted@1702900000000.ro',
    );
    const old = await volunteer(
      'Deleted Deleted',
      'account-deleted@1702900000001.ro',
      null,
    );
    const useCase = testApp.app.get(FinishOldAccountDeletionsUseCase);

    const dry = await useCase.execute(false, { onlyProfiles: true });
    expect(dry.found.map(({ userId }) => userId)).toEqual([half.userId]);

    const applied = await useCase.execute(true, { onlyProfiles: true });
    expect(applied.erased).toEqual([half.userId]);

    // the old anonymized account keeps its volunteer record and hours
    const [{ count: logs }] = await q(
      `SELECT count(*)::int AS count FROM activity_log WHERE volunteer_id = $1`,
      [old.volunteerId],
    );
    expect(logs).toBe(1);
    // and a full run still finds it
    expect(
      (await useCase.execute(false)).found.map(({ userId }) => userId),
    ).toEqual([old.userId]);
  });
});
