import { DataSource } from 'typeorm';
import {
  createTestAuthConfig,
  generateTestAuthKeys,
} from '../../../../test/utils/auth-test-config';
import {
  createTestDataSource,
  truncate,
} from '../../../../test/utils/test-data-source';
import { AuthIdentityProviderEntity } from '../entities/auth-identity-provider.entity';
import { AuthIdentityEntity } from '../entities/auth-identity.entity';
import { AuthTokenEntity } from '../entities/auth-token.entity';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { AuthRealm, AuthTokenForm, AuthTokenType } from '../enums/auth.enums';
import { AuthExceptionCodes } from '../exceptions/exceptions';
import { IAuthIdentityModel } from '../models/auth-identity.model';
import { AuthIdentityProviderRepository } from '../repositories/auth-identity-provider.repository';
import { AuthIdentityRepository } from '../repositories/auth-identity.repository';
import { AuthTokenRepository } from '../repositories/auth-token.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { AuthIdentityFacade } from './auth-identity.facade';
import { OneTimeTokenService } from './one-time-token.service';

// Runs against the local vic_test database (see test/utils/test-data-source.ts).
describe('OneTimeTokenService (database)', () => {
  let dataSource: DataSource;
  let facade: AuthIdentityFacade;
  let service: OneTimeTokenService;
  let ana: IAuthIdentityModel;
  let bogdan: IAuthIdentityModel;
  const keys = generateTestAuthKeys();

  const rejectsWith = (
    promise: Promise<unknown>,
    code: AuthExceptionCodes,
  ): Promise<void> =>
    expect(promise).rejects.toMatchObject({ response: { code_error: code } });

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
    service = new OneTimeTokenService(
      facade,
      createTestAuthConfig({}, keys),
      dataSource,
    );
  });

  afterAll(async () => {
    await dataSource?.destroy();
  });

  beforeEach(async () => {
    await truncate(dataSource, ['auth_identity', 'user', 'organization']);
    ana = await facade.createIdentity({
      realm: AuthRealm.MOBILE,
      email: 'ana@example.ro',
    });
    bogdan = await facade.createIdentity({
      realm: AuthRealm.MOBILE,
      email: 'bogdan@example.ro',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const issueLink = (
    type = AuthTokenType.LOGIN,
    identity = ana,
  ): ReturnType<OneTimeTokenService['issue']> =>
    service.issue({ identity, type, form: AuthTokenForm.LINK });

  const issueCode = (
    identity = ana,
  ): ReturnType<OneTimeTokenService['issue']> =>
    service.issue({
      identity,
      type: AuthTokenType.LOGIN,
      form: AuthTokenForm.CODE,
    });

  describe('issue', () => {
    it('makes a 43-character base64url link and stores only its hash', async () => {
      const { secret, token } = await issueLink();

      expect(secret).toMatch(/^[A-Za-z0-9_-]{43}$/);
      expect(token.tokenHash).not.toContain(secret);
      expect(token.sentTo).toBe('ana@example.ro');
      // a login link lasts 15 minutes (VIC 2.0, #514)
      expect(token.expiresAt.getTime() - Date.now()).toBeGreaterThan(
        14 * 60 * 1000,
      );
    });

    it('makes a 6-digit code and keeps leading zeros', async () => {
      // The service reads randomInt from the required module at call time; `import * as` would spy on a copy.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const crypto = require('crypto');
      jest.spyOn(crypto, 'randomInt').mockReturnValueOnce(42 as never);

      const { secret, token } = await issueCode();

      expect(secret).toBe('000042');
      expect(token.form).toBe(AuthTokenForm.CODE);
      expect(token.expiresAt.getTime() - Date.now()).toBeLessThanOrEqual(
        15 * 60 * 1000,
      );
    });

    it('ends the previous live token of the same type', async () => {
      const first = await issueLink();
      const second = await issueLink();

      await expect(service.peekLink(first.secret)).resolves.toBeNull();
      await expect(service.peekLink(second.secret)).resolves.toMatchObject({
        id: second.token.id,
      });
    });

    it('joins the transaction it is given', async () => {
      let issued: string;

      await expect(
        dataSource.transaction(async (manager) => {
          issued = (
            await service.issue(
              {
                identity: ana,
                type: AuthTokenType.INVITE,
                form: AuthTokenForm.LINK,
              },
              manager,
            )
          ).secret;
          throw new Error('rollback');
        }),
      ).rejects.toThrow('rollback');

      await expect(service.findAnyByLink(issued)).resolves.toBeNull();
    });
  });

  describe('peekLink and findAnyByLink', () => {
    it('finds a live link with its identity and changes nothing', async () => {
      const { secret } = await issueLink(AuthTokenType.VERIFY_EMAIL);

      const token = await service.peekLink(secret);

      expect(token).toMatchObject({
        type: AuthTokenType.VERIFY_EMAIL,
        identity: expect.objectContaining({ id: ana.id }),
        usedAt: null,
      });
      await expect(service.peekLink(secret)).resolves.not.toBeNull();
    });

    it('checks the type when one is given', async () => {
      const { secret } = await issueLink(AuthTokenType.INVITE);

      await expect(
        service.peekLink(secret, AuthTokenType.LOGIN),
      ).resolves.toBeNull();
      await expect(
        service.peekLink(secret, AuthTokenType.INVITE),
      ).resolves.not.toBeNull();
    });

    it('rejects unknown, malformed, expired, used and replaced links', async () => {
      const expired = await issueLink(AuthTokenType.VERIFY_EMAIL);
      await dataSource
        .getRepository(AuthTokenEntity)
        .update(expired.token.id, { expiresAt: new Date(Date.now() - 1000) });
      const used = await issueLink(AuthTokenType.INVITE);
      await service.consume(used.token);
      const replaced = await issueLink();
      await issueLink();

      await expect(service.peekLink('A'.repeat(43))).resolves.toBeNull();
      await expect(service.peekLink('short')).resolves.toBeNull();
      await expect(service.peekLink(undefined)).resolves.toBeNull();
      for (const { secret } of [expired, used, replaced]) {
        await expect(service.peekLink(secret)).resolves.toBeNull();
        await expect(service.findAnyByLink(secret)).resolves.not.toBeNull();
      }
    });

    it('does not find a link once the key changes', async () => {
      const { secret } = await issueLink();
      const otherKey = new OneTimeTokenService(
        facade,
        createTestAuthConfig({}, generateTestAuthKeys()),
        dataSource,
      );

      await expect(otherKey.peekLink(secret)).resolves.toBeNull();
    });
  });

  describe('verifyCode', () => {
    it('accepts the right code', async () => {
      const { secret, token } = await issueCode();

      await expect(
        service.verifyCode(ana, AuthTokenType.LOGIN, secret),
      ).resolves.toMatchObject({ id: token.id });
    });

    it('refuses the same digits for another identity', async () => {
      const { secret } = await issueCode(ana);
      await issueCode(bogdan);

      await rejectsWith(
        service.verifyCode(bogdan, AuthTokenType.LOGIN, secret),
        AuthExceptionCodes.AUTH_005,
      );
    });

    it('ends the code at the fifth wrong attempt, even for the right code afterwards', async () => {
      const { secret } = await issueCode();
      const wrong = secret === '000000' ? '000001' : '000000';

      for (let attempt = 1; attempt <= 4; attempt++) {
        await rejectsWith(
          service.verifyCode(ana, AuthTokenType.LOGIN, wrong),
          AuthExceptionCodes.AUTH_005,
        );
      }
      await rejectsWith(
        service.verifyCode(ana, AuthTokenType.LOGIN, wrong),
        AuthExceptionCodes.AUTH_006,
      );
      await rejectsWith(
        service.verifyCode(ana, AuthTokenType.LOGIN, secret),
        AuthExceptionCodes.AUTH_005,
      );
    });

    it('refuses a code when only a link is live, and a malformed code', async () => {
      await issueLink();

      await rejectsWith(
        service.verifyCode(ana, AuthTokenType.LOGIN, '123456'),
        AuthExceptionCodes.AUTH_005,
      );

      const { token } = await issueCode();
      await rejectsWith(
        service.verifyCode(ana, AuthTokenType.LOGIN, '12ab56'),
        AuthExceptionCodes.AUTH_005,
      );
      const [row] = await dataSource.query(
        'SELECT attempts FROM auth_token WHERE id = $1',
        [token.id],
      );
      expect(row.attempts).toBe(1);
    });
  });

  describe('consume', () => {
    it('works once', async () => {
      const { token } = await issueLink(AuthTokenType.VERIFY_EMAIL);

      await service.consume(token);
      await rejectsWith(service.consume(token), AuthExceptionCodes.AUTH_005);
    });

    it('consuming a reset ends the live invite (the transition link) too', async () => {
      const invite = await issueLink(AuthTokenType.INVITE);
      const reset = await issueLink(AuthTokenType.LOGIN);
      const verify = await issueLink(AuthTokenType.VERIFY_EMAIL);

      await service.consume(reset.token);

      await expect(service.peekLink(invite.secret)).resolves.toBeNull();
      await expect(service.peekLink(verify.secret)).resolves.not.toBeNull();
    });

    it("leaves other identities' tokens alone", async () => {
      const ours = await issueLink(AuthTokenType.INVITE, ana);
      const theirs = await issueLink(AuthTokenType.INVITE, bogdan);

      await service.consume(ours.token);

      await expect(service.peekLink(theirs.secret)).resolves.not.toBeNull();
    });
  });

  it.each([
    ['ana@example.ro', 'a•••@example.ro'],
    ['x@vic.ro', 'x•••@vic.ro'],
    ['not-an-email', '•••'],
  ])('maskEmail(%p) is %p', (input, masked) => {
    expect(service.maskEmail(input)).toBe(masked);
  });
});
