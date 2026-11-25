import { Role } from 'src/common/enums/role.enum';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { createTestAuthConfig } from '../../../../test/utils/auth-test-config';
import { AuthIdentityStatus, AuthRealm } from '../enums/auth.enums';
import { IAuthIdentityModel } from '../models/auth-identity.model';
import { AuthIdentityFacade } from '../services/auth-identity.facade';
import {
  LegacyCognitoAccessToken,
  LegacyCognitoMobileStrategy,
} from './legacy-cognito-mobile.strategy';

const ISSUER = 'https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_TEST';
const FUTURE = new Date(Date.now() + 86400000).toISOString();
const PAST = new Date(Date.now() - 86400000).toISOString();

const identity = (
  overrides: Partial<IAuthIdentityModel> = {},
): IAuthIdentityModel => ({
  id: 'identity-id',
  realm: AuthRealm.MOBILE,
  email: 'volunteer@example.ro',
  status: AuthIdentityStatus.PENDING,
  superAdmin: false,
  emailVerifiedAt: new Date(),
  lastLoginAt: null,
  legacyCognitoUsername: 'cognito-username',
  userId: 'user-id',
  createdOn: new Date(),
  updatedOn: new Date(),
  ...overrides,
});

const token = (
  overrides: Partial<LegacyCognitoAccessToken> = {},
): LegacyCognitoAccessToken => ({
  iss: ISSUER,
  token_use: 'access',
  client_id: 'old-app-client',
  username: 'cognito-username',
  ...overrides,
});

const rawJwt = (claims: object): string =>
  [
    Buffer.from('{"alg":"RS256","kid":"k"}').toString('base64url'),
    Buffer.from(JSON.stringify(claims)).toString('base64url'),
    'signature',
  ].join('.');

describe('LegacyCognitoMobileStrategy', () => {
  let facade: { findIdentity: jest.Mock };
  let users: { findRegularUser: jest.Mock };
  const volunteer = { id: 'user-id', name: 'Ion Voluntar' };

  const build = (
    overrides: Record<string, string> = {},
  ): LegacyCognitoMobileStrategy =>
    new LegacyCognitoMobileStrategy(
      facade as unknown as AuthIdentityFacade,
      users as unknown as UserFacadeService,
      createTestAuthConfig({
        LEGACY_COGNITO_MOBILE_ISSUER: ISSUER,
        LEGACY_MOBILE_UNTIL: FUTURE,
        ...overrides,
      }),
    );

  beforeEach(() => {
    facade = { findIdentity: jest.fn().mockResolvedValue(identity()) };
    users = { findRegularUser: jest.fn().mockResolvedValue(volunteer) };
  });

  it('maps a Cognito access token to the migrated volunteer', async () => {
    await expect(build().validate(token())).resolves.toEqual({
      ...volunteer,
      identityId: 'identity-id',
      sessionId: null,
      role: Role.VOLUNTEER,
    });
    expect(facade.findIdentity).toHaveBeenCalledWith({
      realm: AuthRealm.MOBILE,
      legacyCognitoUsername: 'cognito-username',
    });
    expect(users.findRegularUser).toHaveBeenCalledWith({ id: 'user-id' });
  });

  it('accepts an identity that already logged in to the new app', async () => {
    facade.findIdentity.mockResolvedValue(
      identity({ status: AuthIdentityStatus.ACTIVE }),
    );
    await expect(build().validate(token())).resolves.toMatchObject({
      id: 'user-id',
    });
  });

  it.each([
    ['a disabled identity', identity({ status: AuthIdentityStatus.DISABLED })],
    ['no identity (signed up in Cognito after the cutover)', null],
    ['an identity without a profile', identity({ userId: null })],
  ])('refuses %s', async (_, found) => {
    facade.findIdentity.mockResolvedValue(found);
    await expect(build().validate(token())).resolves.toBeNull();
  });

  it('refuses an id token or a token without username', async () => {
    const strategy = build();
    await expect(
      strategy.validate(token({ token_use: 'id' })),
    ).resolves.toBeNull();
    await expect(
      strategy.validate(token({ username: '' })),
    ).resolves.toBeNull();
    expect(facade.findIdentity).not.toHaveBeenCalled();
  });

  it('refuses another app client when the client id is configured', async () => {
    const strategy = build({
      LEGACY_COGNITO_MOBILE_CLIENT_ID: 'old-app-client',
    });
    await expect(
      strategy.validate(token({ client_id: 'someone-else' })),
    ).resolves.toBeNull();
    await expect(strategy.validate(token())).resolves.not.toBeNull();
  });

  it('refuses everything once the period is over or when not configured', async () => {
    await expect(
      build({ LEGACY_MOBILE_UNTIL: PAST }).validate(token()),
    ).resolves.toBeNull();
    await expect(
      build({ LEGACY_MOBILE_UNTIL: '' }).validate(token()),
    ).resolves.toBeNull();
    await expect(
      build({ LEGACY_COGNITO_MOBILE_ISSUER: '' }).validate(token()),
    ).resolves.toBeNull();
  });

  describe('key lookup', () => {
    const lookup = (
      strategy: LegacyCognitoMobileStrategy,
      jwt: string,
    ): Promise<unknown> =>
      new Promise((resolve) =>
        // passport-jwt keeps the provider on the instance
        (
          strategy as unknown as {
            _secretOrKeyProvider: (
              request: object,
              rawJwt: string,
              done: (err: unknown) => void,
            ) => void;
          }
        )._secretOrKeyProvider({}, jwt, (err: unknown) => resolve(err)),
      );

    it('does not fetch keys for a token from another issuer', async () => {
      const err = await lookup(build(), rawJwt({ iss: 'vic-api' }));
      expect(err).toEqual(new Error('not a legacy token'));
    });

    it('does not fetch keys after the period', async () => {
      const err = await lookup(
        build({ LEGACY_MOBILE_UNTIL: PAST }),
        rawJwt({ iss: ISSUER }),
      );
      expect(err).toEqual(new Error('not a legacy token'));
    });

    it('does not fetch keys for a malformed token', async () => {
      const err = await lookup(build(), 'not-a-jwt');
      expect(err).toEqual(new Error('not a legacy token'));
    });
  });
});
