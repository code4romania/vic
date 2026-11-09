import { DataSource } from 'typeorm';
import {
  createTestDataSource,
  truncate,
} from '../../../../test/utils/test-data-source';
import { AuthIdentityProviderEntity } from '../entities/auth-identity-provider.entity';
import { AuthIdentityEntity } from '../entities/auth-identity.entity';
import { AuthTokenEntity } from '../entities/auth-token.entity';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import {
  AuthIdentityStatus,
  AuthProvider,
  AuthRealm,
  AuthTokenForm,
  AuthTokenType,
} from '../enums/auth.enums';
import { AuthIdentityProviderRepository } from './auth-identity-provider.repository';
import { AuthIdentityRepository } from './auth-identity.repository';
import { AuthTokenRepository } from './auth-token.repository';
import { RefreshTokenRepository } from './refresh-token.repository';

// Runs against the local vic_test database (see test/utils/test-data-source.ts).
describe('auth repositories (database)', () => {
  let dataSource: DataSource;
  let identities: AuthIdentityRepository;
  let tokens: AuthTokenRepository;
  let sessions: RefreshTokenRepository;
  let providers: AuthIdentityProviderRepository;

  const MINUTE = 60 * 1000;
  const DAY = 24 * 60 * MINUTE;
  const ago = (ms: number): Date => new Date(Date.now() - ms);
  const fromNow = (ms: number): Date => new Date(Date.now() + ms);

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    identities = new AuthIdentityRepository(
      dataSource.getRepository(AuthIdentityEntity),
    );
    tokens = new AuthTokenRepository(dataSource.getRepository(AuthTokenEntity));
    sessions = new RefreshTokenRepository(
      dataSource.getRepository(RefreshTokenEntity),
    );
    providers = new AuthIdentityProviderRepository(
      dataSource.getRepository(AuthIdentityProviderEntity),
    );
  });

  afterAll(async () => {
    await dataSource?.destroy();
  });

  beforeEach(async () => {
    await truncate(dataSource, ['auth_identity', 'user', 'organization']);
  });

  const insertOrganization = async (name: string): Promise<string> => {
    const [row] = await dataSource.query(
      `INSERT INTO organization (name, email, phone) VALUES ($1, $2, $3) RETURNING id`,
      [name, `${name}@org.test`, `+40${Math.floor(Math.random() * 1e9)}`],
    );
    return row.id;
  };

  const insertAdmin = async (
    email: string,
    organizationId: string,
  ): Promise<string> => {
    const [row] = await dataSource.query(
      `INSERT INTO "user" (type, cognito_id, name, email, phone, organization_id)
       VALUES ('admin', $1, 'Admin', $1, '+40700000000', $2) RETURNING id`,
      [email, organizationId],
    );
    return row.id;
  };

  const createIdentity = (
    email: string,
    realm = AuthRealm.WEB,
    extra: Partial<Parameters<AuthIdentityRepository['create']>[0]> = {},
  ): ReturnType<AuthIdentityRepository['create']> =>
    identities.create({ realm, email, ...extra });

  const createToken = async (
    identityId: string,
    tokenHash: string,
    extra: Partial<AuthTokenEntity> = {},
  ): Promise<string> => {
    const token = await tokens.create({
      identityId,
      tokenHash,
      type: AuthTokenType.LOGIN,
      form: AuthTokenForm.LINK,
      expiresAt: fromNow(60 * MINUTE),
    });
    if (Object.keys(extra).length) {
      await dataSource.getRepository(AuthTokenEntity).update(token.id, extra);
    }
    return token.id;
  };

  describe('AuthIdentityRepository', () => {
    it('stores the email trimmed and lowercased and finds it by any spelling', async () => {
      await createIdentity('  Ana@Example.RO ');

      const found = await identities.find({
        realm: AuthRealm.WEB,
        email: 'ANA@example.ro',
      });

      expect(found.email).toBe('ana@example.ro');
      expect(found.status).toBe(AuthIdentityStatus.PENDING);
    });

    it('allows the same email once per realm', async () => {
      await createIdentity('both@example.ro', AuthRealm.WEB);
      await createIdentity('both@example.ro', AuthRealm.MOBILE);

      await expect(
        createIdentity('BOTH@example.ro', AuthRealm.WEB),
      ).rejects.toThrow(/auth_identity_realm_email_unique/);
    });

    it('returns null for an undefined key instead of the first row', async () => {
      await createIdentity('someone@example.ro');

      await expect(identities.find({ userId: undefined })).resolves.toBeNull();
      await expect(identities.find({ id: null })).resolves.toBeNull();
    });

    it('upsert creates once and leaves the existing row alone on the second run', async () => {
      const first = await identities.upsert({
        realm: AuthRealm.MOBILE,
        email: 'Volunteer@example.ro',
        legacyCognitoUsername: 'first',
      });
      const second = await identities.upsert({
        realm: AuthRealm.MOBILE,
        email: 'volunteer@example.ro',
        legacyCognitoUsername: 'second',
      });

      expect(first.created).toBe(true);
      expect(second.created).toBe(false);
      expect(second.identity.id).toBe(first.identity.id);
      expect(second.identity.legacyCognitoUsername).toBe('first');
    });

    it('deleteByUserId removes the identity with its tokens, sessions and provider links', async () => {
      const organizationId = await insertOrganization('seed-org');
      const userId = await insertAdmin('admin@example.ro', organizationId);
      const identity = await createIdentity('admin@example.ro', AuthRealm.WEB, {
        userId,
      });
      await createToken(identity.id, 'token-hash');
      await sessions.create({
        identityId: identity.id,
        tokenHash: 'session-hash',
        expiresAt: fromNow(DAY),
      });
      await providers.linkProvider({
        identityId: identity.id,
        provider: AuthProvider.GOOGLE,
        subject: 'google-subject',
      });

      await expect(identities.deleteByUserId(undefined)).resolves.toBe(0);
      await expect(identities.deleteByUserId(userId)).resolves.toBe(1);

      await expect(identities.find({ id: identity.id })).resolves.toBeNull();
      await expect(tokens.findAnyByHash('token-hash')).resolves.toBeNull();
      await expect(
        sessions.findSessionByHash('session-hash'),
      ).resolves.toBeNull();
      await expect(
        providers.findByProvider(AuthProvider.GOOGLE, 'google-subject'),
      ).resolves.toBeNull();
    });

    it("findByOrganizationId returns only the web identities of that NGO's admins", async () => {
      const ours = await insertOrganization('ours');
      const theirs = await insertOrganization('theirs');
      const ourAdmin = await insertAdmin('ours@example.ro', ours);
      const theirAdmin = await insertAdmin('theirs@example.ro', theirs);
      const expected = await createIdentity('ours@example.ro', AuthRealm.WEB, {
        userId: ourAdmin,
      });
      await createIdentity('theirs@example.ro', AuthRealm.WEB, {
        userId: theirAdmin,
      });
      await createIdentity('ours@example.ro', AuthRealm.MOBILE, {
        userId: ourAdmin,
      });

      const found = await identities.findByOrganizationId(ours);

      expect(found.map((identity) => identity.id)).toEqual([expected.id]);
      await expect(identities.findByOrganizationId(undefined)).resolves.toEqual(
        [],
      );
    });

    it('findSuperAdmins returns web super admins only', async () => {
      const superAdmin = await createIdentity(
        'super@example.ro',
        AuthRealm.WEB,
        {
          superAdmin: true,
        },
      );
      await createIdentity('plain@example.ro');

      const found = await identities.findSuperAdmins();

      expect(found.map((identity) => identity.id)).toEqual([superAdmin.id]);
    });

    it('deleteUnverifiedMobileBefore keeps verified, linked, web and recent identities', async () => {
      const organizationId = await insertOrganization('cleanup-org');
      const userId = await insertAdmin('linked@example.ro', organizationId);
      const stale = await createIdentity('stale@example.ro', AuthRealm.MOBILE);
      const verified = await createIdentity(
        'verified@example.ro',
        AuthRealm.MOBILE,
        { emailVerifiedAt: new Date() },
      );
      const linked = await createIdentity(
        'linked@example.ro',
        AuthRealm.MOBILE,
        {
          userId,
        },
      );
      const web = await createIdentity('web@example.ro', AuthRealm.WEB);
      await dataSource.query(
        `UPDATE auth_identity SET created_on = $1 WHERE id = ANY($2)`,
        [ago(8 * DAY), [stale.id, verified.id, linked.id, web.id]],
      );
      const recent = await createIdentity(
        'recent@example.ro',
        AuthRealm.MOBILE,
      );

      await expect(
        identities.deleteUnverifiedMobileBefore(ago(7 * DAY)),
      ).resolves.toBe(1);

      await expect(identities.find({ id: stale.id })).resolves.toBeNull();
      for (const kept of [verified, linked, web, recent]) {
        await expect(identities.find({ id: kept.id })).resolves.not.toBeNull();
      }
    });

    it('create and update given a manager join its transaction', async () => {
      const existing = await createIdentity('existing@example.ro');

      await expect(
        dataSource.transaction(async (manager) => {
          await identities.create(
            { realm: AuthRealm.WEB, email: 'rolled-back@example.ro' },
            manager,
          );
          await identities.update(
            existing.id,
            { status: AuthIdentityStatus.ACTIVE },
            manager,
          );
          throw new Error('rollback');
        }),
      ).rejects.toThrow('rollback');

      await expect(
        identities.find({
          realm: AuthRealm.WEB,
          email: 'rolled-back@example.ro',
        }),
      ).resolves.toBeNull();
      await expect(identities.find({ id: existing.id })).resolves.toMatchObject(
        { status: AuthIdentityStatus.PENDING },
      );
    });
  });

  describe('AuthTokenRepository', () => {
    let identityId: string;

    beforeEach(async () => {
      identityId = (await createIdentity('tokens@example.ro')).id;
    });

    it('findByHash returns live rows only; findAnyByHash returns used, replaced and expired rows too', async () => {
      await createToken(identityId, 'live');
      await createToken(identityId, 'used', { usedAt: new Date() });
      await createToken(identityId, 'replaced', { replacedAt: new Date() });
      await createToken(identityId, 'expired', { expiresAt: ago(MINUTE) });

      await expect(tokens.findByHash('live')).resolves.toMatchObject({
        tokenHash: 'live',
        identity: expect.objectContaining({ id: identityId }),
      });
      for (const hash of ['used', 'replaced', 'expired']) {
        await expect(tokens.findByHash(hash)).resolves.toBeNull();
        await expect(tokens.findAnyByHash(hash)).resolves.toMatchObject({
          tokenHash: hash,
        });
      }
      await expect(tokens.findByHash(undefined)).resolves.toBeNull();
    });

    it('replaceLiveTokens ends the live rows of the given types only', async () => {
      await createToken(identityId, 'reset');
      const invite = await tokens.create({
        identityId,
        tokenHash: 'invite',
        type: AuthTokenType.INVITE,
        form: AuthTokenForm.LINK,
        expiresAt: fromNow(DAY),
      });

      await expect(
        tokens.replaceLiveTokens(identityId, [AuthTokenType.LOGIN]),
      ).resolves.toBe(1);

      await expect(tokens.findByHash('reset')).resolves.toBeNull();
      await expect(
        tokens.findLiveToken(identityId, AuthTokenType.INVITE),
      ).resolves.toMatchObject({ id: invite.id });
    });

    it('consume succeeds once', async () => {
      const id = await createToken(identityId, 'once');

      await expect(tokens.consume(id)).resolves.toBe(true);
      await expect(tokens.consume(id)).resolves.toBe(false);
      await expect(tokens.findByHash('once')).resolves.toBeNull();
    });

    it('incrementAttempts returns the new count', async () => {
      const id = await createToken(identityId, 'code');

      await expect(tokens.incrementAttempts(id)).resolves.toBe(1);
      await expect(tokens.incrementAttempts(id)).resolves.toBe(2);
    });

    it('deleteEndedBefore keeps live rows and rows that ended after the date', async () => {
      await createToken(identityId, 'old-used', { usedAt: ago(91 * DAY) });
      await createToken(identityId, 'old-replaced', {
        replacedAt: ago(91 * DAY),
      });
      await createToken(identityId, 'old-expired', {
        expiresAt: ago(91 * DAY),
      });
      await createToken(identityId, 'recent-used', { usedAt: ago(DAY) });
      await createToken(identityId, 'live');

      await expect(tokens.deleteEndedBefore(ago(90 * DAY))).resolves.toBe(3);

      await expect(tokens.findAnyByHash('recent-used')).resolves.not.toBeNull();
      await expect(tokens.findAnyByHash('live')).resolves.not.toBeNull();
    });

    it('create and consume given a manager join its transaction', async () => {
      const id = await createToken(identityId, 'kept-live');

      await expect(
        dataSource.transaction(async (manager) => {
          await tokens.create(
            {
              identityId,
              tokenHash: 'rolled-back',
              type: AuthTokenType.INVITE,
              form: AuthTokenForm.LINK,
              expiresAt: fromNow(DAY),
            },
            manager,
          );
          await tokens.consume(id, manager);
          throw new Error('rollback');
        }),
      ).rejects.toThrow('rollback');

      await expect(tokens.findAnyByHash('rolled-back')).resolves.toBeNull();
      await expect(tokens.findByHash('kept-live')).resolves.not.toBeNull();
    });
  });

  describe('RefreshTokenRepository', () => {
    let identityId: string;

    beforeEach(async () => {
      identityId = (await createIdentity('sessions@example.ro')).id;
    });

    it('rotate moves the current hash to previous_hash, only while the presented hash is current', async () => {
      const session = await sessions.create({
        identityId,
        tokenHash: 'first',
        expiresAt: fromNow(DAY),
      });
      const expiresAt = fromNow(7 * DAY);

      await expect(
        sessions.rotate(session.id, 'not-current', 'other', expiresAt),
      ).resolves.toBeNull();
      const rotated = await sessions.rotate(
        session.id,
        'first',
        'second',
        expiresAt,
      );

      expect(rotated).toMatchObject({
        tokenHash: 'second',
        previousHash: 'first',
      });
      expect(rotated.expiresAt.getTime()).toBe(expiresAt.getTime());
      expect(rotated.rotatedAt).toBeInstanceOf(Date);
      expect(rotated.lastUsedAt).toBeInstanceOf(Date);
      await expect(
        sessions.findSessionByPreviousHash('first'),
      ).resolves.toMatchObject({ id: session.id });
      await expect(sessions.findSessionByHash('first')).resolves.toBeNull();
    });

    it('revokeAllForIdentity keeps the excepted session', async () => {
      const current = await sessions.create({
        identityId,
        tokenHash: 'current',
        expiresAt: fromNow(DAY),
      });
      await sessions.create({
        identityId,
        tokenHash: 'other',
        expiresAt: fromNow(DAY),
      });

      await expect(
        sessions.revokeAllForIdentity(identityId, current.id),
      ).resolves.toBe(1);

      await expect(
        sessions.findSessionByHash('current'),
      ).resolves.toMatchObject({ revokedAt: null });
      expect(
        (await sessions.findSessionByHash('other')).revokedAt,
      ).toBeInstanceOf(Date);
      await expect(sessions.revoke(current.id)).resolves.toBe(true);
      await expect(sessions.revoke(current.id)).resolves.toBe(false);
    });

    it('deleteExpiredOrRevokedBefore keeps live sessions and recent revocations', async () => {
      const repository = dataSource.getRepository(RefreshTokenEntity);
      const make = async (
        tokenHash: string,
        extra: Partial<RefreshTokenEntity>,
      ): Promise<void> => {
        const session = await sessions.create({
          identityId,
          tokenHash,
          expiresAt: fromNow(DAY),
        });
        await repository.update(session.id, extra);
      };
      await make('expired', { expiresAt: ago(MINUTE) });
      await make('revoked-long-ago', { revokedAt: ago(8 * DAY) });
      await make('revoked-recently', { revokedAt: ago(DAY) });
      await make('live', {});

      await expect(
        sessions.deleteExpiredOrRevokedBefore(new Date(), ago(7 * DAY)),
      ).resolves.toBe(2);

      await expect(
        sessions.findSessionByHash('revoked-recently'),
      ).resolves.not.toBeNull();
      await expect(sessions.findSessionByHash('live')).resolves.not.toBeNull();
    });

    it('revokeAllForIdentity given a manager joins its transaction', async () => {
      await sessions.create({
        identityId,
        tokenHash: 'stays-live',
        expiresAt: fromNow(DAY),
      });

      await expect(
        dataSource.transaction(async (manager) => {
          await sessions.revokeAllForIdentity(identityId, undefined, manager);
          throw new Error('rollback');
        }),
      ).rejects.toThrow('rollback');

      await expect(
        sessions.findSessionByHash('stays-live'),
      ).resolves.toMatchObject({ revokedAt: null });
    });
  });

  describe('AuthIdentityProviderRepository', () => {
    it('links a provider once per subject', async () => {
      const identity = await createIdentity(
        'social@example.ro',
        AuthRealm.MOBILE,
      );

      await providers.linkProvider({
        identityId: identity.id,
        provider: AuthProvider.APPLE,
        subject: 'apple-subject',
        emailAtLink: 'Social@Example.ro',
      });

      await expect(
        providers.findByProvider(AuthProvider.APPLE, 'apple-subject'),
      ).resolves.toMatchObject({
        identityId: identity.id,
        emailAtLink: 'social@example.ro',
      });
      await expect(
        providers.linkProvider({
          identityId: identity.id,
          provider: AuthProvider.APPLE,
          subject: 'apple-subject',
        }),
      ).rejects.toThrow(/auth_identity_provider_provider_subject_unique/);
      await expect(
        providers.findByProvider(AuthProvider.APPLE, undefined),
      ).resolves.toBeNull();
    });
  });
});
