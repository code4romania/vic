import { JwtService } from '@nestjs/jwt';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';
import { DataSource } from 'typeorm';
import { createTestAuthConfig } from '../../../../test/utils/auth-test-config';
import {
  createTestDataSource,
  truncate,
} from '../../../../test/utils/test-data-source';
import { AuthIdentityProviderEntity } from '../entities/auth-identity-provider.entity';
import { AuthIdentityEntity } from '../entities/auth-identity.entity';
import { AuthTokenEntity } from '../entities/auth-token.entity';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { AuthIdentityStatus, AuthRealm } from '../enums/auth.enums';
import { AuthExceptionCodes } from '../exceptions/exceptions';
import { IAuthIdentityModel } from '../models/auth-identity.model';
import { AuthIdentityProviderRepository } from '../repositories/auth-identity-provider.repository';
import { AuthIdentityRepository } from '../repositories/auth-identity.repository';
import { AuthTokenRepository } from '../repositories/auth-token.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { AuthIdentityFacade } from './auth-identity.facade';
import { SessionService } from './session.service';

// Runs against the local vic_test database (see test/utils/test-data-source.ts).
describe('SessionService (database)', () => {
  let dataSource: DataSource;
  let facade: AuthIdentityFacade;
  let authConfig: AuthConfigService;
  let jwtService: JwtService;
  let service: SessionService;
  let identity: IAuthIdentityModel;

  const rejectsWith = (
    promise: Promise<unknown>,
    code: AuthExceptionCodes,
  ): Promise<void> =>
    expect(promise).rejects.toMatchObject({ response: { code_error: code } });

  const decode = (token: string): Record<string, unknown> =>
    jwtService.verify(token, { audience: ['vic-web', 'vic-mobile'] });

  // rotated_at comes from Postgres; move the clock to a moment relative to it.
  const secondsAfterRotation = async (
    sessionId: string,
    seconds: number,
  ): Promise<void> => {
    const [row] = await dataSource.query(
      'SELECT rotated_at FROM refresh_token WHERE id = $1',
      [sessionId],
    );
    jest.setSystemTime(new Date(row.rotated_at).getTime() + seconds * 1000);
  };

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    facade = new AuthIdentityFacade(
      new AuthIdentityRepository(dataSource.getRepository(AuthIdentityEntity)),
      new AuthTokenRepository(dataSource.getRepository(AuthTokenEntity)),
      new RefreshTokenRepository(dataSource.getRepository(RefreshTokenEntity)),
      new AuthIdentityProviderRepository(
        dataSource.getRepository(AuthIdentityProviderEntity),
      ),
    );
    authConfig = createTestAuthConfig();
    jwtService = new JwtService(authConfig.createJwtOptions());
    service = new SessionService(facade, jwtService, authConfig);
  });

  afterAll(async () => {
    await dataSource?.destroy();
  });

  beforeEach(async () => {
    jest.useFakeTimers({
      doNotFake: ['nextTick', 'setImmediate', 'setTimeout', 'setInterval'],
    });
    jest.setSystemTime(new Date());
    await truncate(dataSource, ['auth_identity', 'user', 'organization']);
    identity = await facade.createIdentity({
      realm: AuthRealm.WEB,
      email: 'admin@example.ro',
      status: AuthIdentityStatus.ACTIVE,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('signs an RS256 access token with sub, sid, audience, issuer and kid', () => {
    const token = service.signAccessToken(identity, AuthRealm.WEB, 'session');

    const [header] = token.split('.');
    expect(JSON.parse(Buffer.from(header, 'base64url').toString())).toEqual(
      expect.objectContaining({ alg: 'RS256', kid: 'test' }),
    );
    expect(decode(token)).toEqual(
      expect.objectContaining({
        sub: identity.id,
        sid: 'session',
        aud: 'vic-web',
        iss: 'vic-api',
      }),
    );
    const { iat, exp } = decode(token) as { iat: number; exp: number };
    expect(exp - iat).toBe(900);
  });

  it('createSession stores only the hash and puts the session id in sid', async () => {
    const tokens = await service.createSession(identity, AuthRealm.WEB, {
      userAgent: 'jest',
      ip: '127.0.0.1',
    });

    expect(tokens.refreshToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(decode(tokens.accessToken)).toMatchObject({
      sid: tokens.sessionId,
      aud: 'vic-web',
    });
    const [row] = await dataSource.query(
      'SELECT token_hash, user_agent, ip, expires_at FROM refresh_token WHERE id = $1',
      [tokens.sessionId],
    );
    expect(row.token_hash).not.toContain(tokens.refreshToken);
    expect(row).toMatchObject({ user_agent: 'jest', ip: '127.0.0.1' });
    const days = (new Date(row.expires_at).getTime() - Date.now()) / 86400000;
    expect(Math.round(days)).toBe(7);
  });

  it('mobile sessions last 30 days and carry the mobile audience', async () => {
    const volunteer = await facade.createIdentity({
      realm: AuthRealm.MOBILE,
      email: 'volunteer@example.ro',
      status: AuthIdentityStatus.ACTIVE,
    });

    const tokens = await service.createSession(volunteer, AuthRealm.MOBILE);

    expect(decode(tokens.accessToken)).toMatchObject({ aud: 'vic-mobile' });
    const [row] = await dataSource.query(
      'SELECT expires_at FROM refresh_token WHERE id = $1',
      [tokens.sessionId],
    );
    const days = (new Date(row.expires_at).getTime() - Date.now()) / 86400000;
    expect(Math.round(days)).toBe(30);
  });

  describe('rotate', () => {
    it('returns a new pair with the same sid, and the old token stops working later', async () => {
      const first = await service.createSession(identity, AuthRealm.WEB);

      const second = await service.rotate(first.refreshToken, AuthRealm.WEB);

      expect(second.refreshToken).toBeDefined();
      expect(second.refreshToken).not.toBe(first.refreshToken);
      expect(second.sessionId).toBe(first.sessionId);
      expect(decode(second.accessToken)).toMatchObject({
        sid: first.sessionId,
      });
      const third = await service.rotate(second.refreshToken, AuthRealm.WEB);
      expect(third.refreshToken).toBeDefined();
    });

    it('3 s after a rotation the old token returns an access token only (two tabs crossed)', async () => {
      const first = await service.createSession(identity, AuthRealm.WEB);
      const second = await service.rotate(first.refreshToken, AuthRealm.WEB);
      await secondsAfterRotation(first.sessionId, 3);

      const crossed = await service.rotate(first.refreshToken, AuthRealm.WEB);

      expect(crossed.refreshToken).toBeUndefined();
      expect(decode(crossed.accessToken)).toMatchObject({
        sid: first.sessionId,
      });
      await expect(
        service.rotate(second.refreshToken, AuthRealm.WEB),
      ).resolves.toMatchObject({ sessionId: first.sessionId });
    });

    it('11 s after a rotation the old token is a replay: AUTH_008 and the session is revoked', async () => {
      const first = await service.createSession(identity, AuthRealm.WEB);
      const second = await service.rotate(first.refreshToken, AuthRealm.WEB);
      await secondsAfterRotation(first.sessionId, 11);

      await rejectsWith(
        service.rotate(first.refreshToken, AuthRealm.WEB),
        AuthExceptionCodes.AUTH_008,
      );
      await rejectsWith(
        service.rotate(second.refreshToken, AuthRealm.WEB),
        AuthExceptionCodes.AUTH_008,
      );
    });

    it('refuses an unknown, expired, revoked or other-realm token, and a disabled login', async () => {
      await rejectsWith(
        service.rotate('unknown', AuthRealm.WEB),
        AuthExceptionCodes.AUTH_008,
      );
      await rejectsWith(
        service.rotate(undefined, AuthRealm.WEB),
        AuthExceptionCodes.AUTH_008,
      );

      const expired = await service.createSession(identity, AuthRealm.WEB);
      jest.setSystemTime(Date.now() + 8 * 86400000);
      await rejectsWith(
        service.rotate(expired.refreshToken, AuthRealm.WEB),
        AuthExceptionCodes.AUTH_008,
      );
      jest.setSystemTime(new Date());

      const revoked = await service.createSession(identity, AuthRealm.WEB);
      await service.revoke(revoked.sessionId);
      await rejectsWith(
        service.rotate(revoked.refreshToken, AuthRealm.WEB),
        AuthExceptionCodes.AUTH_008,
      );

      const web = await service.createSession(identity, AuthRealm.WEB);
      await rejectsWith(
        service.rotate(web.refreshToken, AuthRealm.MOBILE),
        AuthExceptionCodes.AUTH_008,
      );

      await facade.updateIdentity(identity.id, {
        status: AuthIdentityStatus.DISABLED,
      });
      await rejectsWith(
        service.rotate(web.refreshToken, AuthRealm.WEB),
        AuthExceptionCodes.AUTH_008,
      );
    });
  });

  it('revokeAll keeps the excepted session and joins a transaction', async () => {
    const current = await service.createSession(identity, AuthRealm.WEB);
    const other = await service.createSession(identity, AuthRealm.WEB);

    await expect(
      dataSource.transaction(async (manager) => {
        await service.revokeAll(identity.id, undefined, manager);
        throw new Error('rollback');
      }),
    ).rejects.toThrow('rollback');
    await expect(
      service.rotate(current.refreshToken, AuthRealm.WEB),
    ).resolves.toBeDefined();

    const otherSecret = (
      await service.rotate(other.refreshToken, AuthRealm.WEB)
    ).refreshToken;
    await expect(
      service.revokeAll(identity.id, current.sessionId),
    ).resolves.toBe(1);
    await rejectsWith(
      service.rotate(otherSecret, AuthRealm.WEB),
      AuthExceptionCodes.AUTH_008,
    );
  });

  it('revokeByRefreshToken ends the session and ignores an unknown token', async () => {
    const tokens = await service.createSession(identity, AuthRealm.WEB);

    await expect(service.revokeByRefreshToken('unknown')).resolves.toBe(false);
    await expect(
      service.revokeByRefreshToken(tokens.refreshToken),
    ).resolves.toBe(true);
    await rejectsWith(
      service.rotate(tokens.refreshToken, AuthRealm.WEB),
      AuthExceptionCodes.AUTH_008,
    );
  });
});
