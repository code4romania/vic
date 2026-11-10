import { ISendMailOptions } from '@nestjs-modules/mailer';
import { DataSource } from 'typeorm';
import {
  createTestDataSource,
  truncate,
} from '../../../test/utils/test-data-source';
import { AuthIdentityProviderEntity } from 'src/modules/auth/entities/auth-identity-provider.entity';
import { AuthIdentityEntity } from 'src/modules/auth/entities/auth-identity.entity';
import { AuthTokenEntity } from 'src/modules/auth/entities/auth-token.entity';
import { RefreshTokenEntity } from 'src/modules/auth/entities/refresh-token.entity';
import {
  AuthIdentityStatus,
  AuthProvider,
  AuthRealm,
  AuthTokenType,
} from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityProviderRepository } from 'src/modules/auth/repositories/auth-identity-provider.repository';
import { AuthIdentityRepository } from 'src/modules/auth/repositories/auth-identity.repository';
import { AuthTokenRepository } from 'src/modules/auth/repositories/auth-token.repository';
import { RefreshTokenRepository } from 'src/modules/auth/repositories/refresh-token.repository';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { AuthMailerService } from 'src/modules/auth/services/auth-mailer.service';
import { OneTimeTokenService } from 'src/modules/auth/services/one-time-token.service';
import { TransitionMailService } from 'src/modules/auth/services/transition-mail.service';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';
import {
  MigrateIdentitiesUseCase,
  providerFromCognitoUsername,
} from './migrate-identities.usecase';

describe('providerFromCognitoUsername', () => {
  it('reads the provider and subject of a federated Cognito username', () => {
    expect(providerFromCognitoUsername('google_1234')).toEqual({
      provider: AuthProvider.GOOGLE,
      subject: '1234',
    });
    expect(providerFromCognitoUsername('Facebook_99')).toEqual({
      provider: AuthProvider.FACEBOOK,
      subject: '99',
    });
    expect(providerFromCognitoUsername('signinwithapple_001.ab_c')).toEqual({
      provider: AuthProvider.APPLE,
      subject: '001.ab_c',
    });
  });

  it('returns null for a plain Cognito user', () => {
    expect(providerFromCognitoUsername('3f0c1b2a-uuid')).toBeNull();
    expect(providerFromCognitoUsername('google_')).toBeNull();
    expect(providerFromCognitoUsername(null)).toBeNull();
  });
});

// Runs against the local vic_test database (see test/utils/test-data-source.ts).
describe('MigrateIdentitiesUseCase (database)', () => {
  let dataSource: DataSource;
  let useCase: MigrateIdentitiesUseCase;
  let held: ISendMailOptions[];

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    const facade = new AuthIdentityFacade(
      new AuthIdentityRepository(dataSource.getRepository(AuthIdentityEntity)),
      new AuthTokenRepository(dataSource.getRepository(AuthTokenEntity)),
      new RefreshTokenRepository(dataSource.getRepository(RefreshTokenEntity)),
      new AuthIdentityProviderRepository(
        dataSource.getRepository(AuthIdentityProviderEntity),
      ),
    );
    const authConfig = {
      authTokenKey: 'migrate-spec-key',
      webAppUrl: 'https://vic.test',
    } as unknown as AuthConfigService;
    const tokens = new OneTimeTokenService(facade, authConfig, dataSource);
    const mailer = new AuthMailerService(null, authConfig);
    const transitionMail = {
      hold: jest.fn(async (emails: ISendMailOptions[]) => {
        held.push(...emails);
        return emails.length;
      }),
    } as unknown as TransitionMailService;

    useCase = new MigrateIdentitiesUseCase(
      dataSource,
      facade,
      tokens,
      mailer,
      transitionMail,
    );
  });

  afterAll(async () => {
    await dataSource?.destroy();
  });

  let organizationId: string;
  beforeEach(async () => {
    held = [];
    await truncate(dataSource, [
      'auth_identity',
      'volunteer',
      'user',
      'organization',
    ]);
    const [row] = await dataSource.query(
      `INSERT INTO organization (name, email, phone) VALUES ('Org', 'org@org.test', '+40711111111') RETURNING id`,
    );
    organizationId = row.id;
  });

  const insertUser = async (
    type: 'admin' | 'regular',
    email: string,
    extra: { cognitoId?: string; createdOn?: Date; deleted?: boolean } = {},
  ): Promise<string> => {
    const params = [
      extra.cognitoId ?? `cognito-${email}`,
      email,
      extra.createdOn ?? new Date(),
      extra.deleted ? new Date() : null,
    ];
    const [row] =
      type === 'admin'
        ? await dataSource.query(
            `INSERT INTO "user" (type, cognito_id, name, email, phone, created_on, deleted_on, organization_id)
             VALUES ('admin', $1, 'Admin', $2, '+40700000000', $3, $4, $5) RETURNING id`,
            [...params, organizationId],
          )
        : await dataSource.query(
            `INSERT INTO "user" (type, cognito_id, name, email, phone, created_on, deleted_on, first_name, last_name)
             VALUES ('regular', $1, 'Vol', $2, '+40700000001', $3, $4, 'Vol', 'Unteer') RETURNING id`,
            params,
          );
    return row.id;
  };

  const identities = (): Promise<AuthIdentityEntity[]> =>
    dataSource.getRepository(AuthIdentityEntity).find();

  it('imports admins and volunteers in pending with one held transition email each', async () => {
    const adminId = await insertUser('admin', 'Admin@Org.ro');
    const volunteerCreated = new Date('2024-05-01T10:00:00Z');
    const volunteerId = await insertUser('regular', 'vol@x.ro', {
      createdOn: volunteerCreated,
    });
    await insertUser('admin', 'both@x.ro');
    await insertUser('regular', 'both@x.ro');
    await insertUser('regular', 'gone@x.ro', { deleted: true });

    const report = await useCase.execute();

    expect(report).toMatchObject({
      admins: 2,
      volunteers: 2,
      skippedDeleted: 1,
      unchanged: 0,
      emailsQueued: 4,
    });
    const rows = await identities();
    expect(rows).toHaveLength(4);
    expect(rows.every((r) => r.status === AuthIdentityStatus.PENDING)).toBe(
      true,
    );

    const admin = rows.find((r) => r.userId === adminId);
    expect(admin).toMatchObject({
      realm: AuthRealm.WEB,
      email: 'admin@org.ro',
      legacyCognitoUsername: 'cognito-Admin@Org.ro',
      emailVerifiedAt: null,
    });
    const volunteer = rows.find((r) => r.userId === volunteerId);
    expect(volunteer.realm).toBe(AuthRealm.MOBILE);
    expect(volunteer.emailVerifiedAt).toEqual(volunteerCreated);

    // Someone who is both gets one identity per realm.
    expect(
      rows
        .filter((r) => r.email === 'both@x.ro')
        .map((r) => r.realm)
        .sort(),
    ).toEqual([AuthRealm.MOBILE, AuthRealm.WEB]);

    // One 30-day transition link per admin: an invite nobody sent (R16). Volunteers get no link; they log in
    // with an emailed code in the app (VIC 2.0, #514).
    const tokens = await dataSource.getRepository(AuthTokenEntity).find();
    expect(tokens).toHaveLength(2);
    for (const token of tokens) {
      expect(token.type).toBe(AuthTokenType.INVITE);
      expect(token.sentById).toBeNull();
      const days = (token.expiresAt.getTime() - Date.now()) / 86_400_000;
      expect(days).toBeGreaterThan(29.9);
    }

    expect(held).toHaveLength(4);
    const adminEmail = held.find((e) => e.to === 'admin@org.ro');
    expect(adminEmail.context.subtitle).toContain('Echipă');
    expect(adminEmail.context.cta.link).toMatch(
      /^https:\/\/vic\.test\/login\/link\?token=[A-Za-z0-9_-]{43}$/,
    );
    const volunteerEmail = held.find((e) => e.to === 'vol@x.ro');
    expect(volunteerEmail.context.cta).toBeNull();
    expect(volunteerEmail.context.english.subtitle).toContain(
      'enter your email in the app and you will get a login code',
    );
  });

  it('links federated volunteers to their provider from the Cognito username (R35)', async () => {
    await insertUser('regular', 'g@x.ro', { cognitoId: 'google_111' });
    await insertUser('regular', 'a@x.ro', {
      cognitoId: 'signinwithapple_222.abc',
    });

    const report = await useCase.execute();

    expect(report.providerLinks).toBe(2);
    const links = await dataSource
      .getRepository(AuthIdentityProviderEntity)
      .find();
    expect(links.map((l) => [l.provider, l.subject]).sort()).toEqual([
      [AuthProvider.APPLE, '222.abc'],
      [AuthProvider.GOOGLE, '111'],
    ]);
  });

  it('a second run changes nothing and holds no email', async () => {
    await insertUser('admin', 'admin@org.ro');
    await insertUser('regular', 'vol@x.ro');
    await useCase.execute();
    held = [];

    const second = await useCase.execute();

    expect(second).toMatchObject({
      admins: 0,
      volunteers: 0,
      unchanged: 2,
      emailsQueued: 0,
    });
    expect(held).toHaveLength(0);
    expect(await dataSource.getRepository(AuthTokenEntity).count()).toBe(1);
  });

  it('keeps the oldest of two rows with the same email and no history, and reports the other', async () => {
    // The unique index ignores case but not spaces, so " Dup@x.ro" and "dup@x.ro" can both exist.
    const older = await insertUser('regular', ' Dup@x.ro', {
      createdOn: new Date('2023-01-01'),
    });
    const newer = await insertUser('regular', 'dup@x.ro', {
      createdOn: new Date('2024-01-01'),
    });

    const report = await useCase.execute({ dryRun: true });
    expect(report.duplicates).toEqual([
      {
        realm: AuthRealm.MOBILE,
        email: 'dup@x.ro',
        keptUserId: older,
        otherUserIds: [newer],
        kept: { userId: older, history: 0, createdOn: expect.any(Date) },
        others: [{ userId: newer, history: 0, createdOn: expect.any(Date) }],
      },
    ]);

    await useCase.execute();
    const [identity] = await identities();
    expect(identity.userId).toBe(older);
  });

  it('M18: keeps the row with history (volunteer records, hours) over a newer empty one', async () => {
    const withHistory = await insertUser('regular', 'hist@x.ro', {
      createdOn: new Date('2024-01-01'),
    });
    const older = await insertUser('regular', ' Hist@x.ro', {
      createdOn: new Date('2022-01-01'),
    });
    await dataSource.query(
      `INSERT INTO volunteer (user_id, organization_id, status) VALUES ($1, $2, 'active')`,
      [withHistory, organizationId],
    );

    const report = await useCase.execute();
    expect(report.duplicates[0]).toMatchObject({
      keptUserId: withHistory,
      otherUserIds: [older],
      kept: { history: 1 },
    });
    const [identity] = await identities();
    expect(identity.userId).toBe(withHistory);
  });

  it('a dry run counts everything and writes nothing', async () => {
    await insertUser('admin', 'admin@org.ro');
    await insertUser('regular', 'g@x.ro', { cognitoId: 'google_1' });

    const report = await useCase.execute({ dryRun: true, batchSize: 1 });

    expect(report).toMatchObject({
      dryRun: true,
      admins: 1,
      volunteers: 1,
      providerLinks: 1,
      emailsQueued: 2,
    });
    expect(await identities()).toHaveLength(0);
    expect(await dataSource.getRepository(AuthTokenEntity).count()).toBe(0);
    expect(held).toHaveLength(0);
  });
});
