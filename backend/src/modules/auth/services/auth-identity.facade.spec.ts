import { AUTH_LOCKOUT } from '../auth.constants';
import { AuthIdentityStatus, AuthRealm } from '../enums/auth.enums';
import { IAuthIdentityModel } from '../models/auth-identity.model';
import { AuthIdentityProviderRepository } from '../repositories/auth-identity-provider.repository';
import { AuthIdentityRepository } from '../repositories/auth-identity.repository';
import { AuthTokenRepository } from '../repositories/auth-token.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { AuthIdentityFacade } from './auth-identity.facade';

describe('AuthIdentityFacade', () => {
  let identityRepository: jest.Mocked<
    Pick<
      AuthIdentityRepository,
      'registerFailedLogin' | 'update' | 'deleteByUserId'
    >
  >;
  let refreshTokenRepository: jest.Mocked<
    Pick<RefreshTokenRepository, 'revokeAllForIdentity'>
  >;
  let facade: AuthIdentityFacade;

  const identity: IAuthIdentityModel = {
    id: 'identity-id',
    realm: AuthRealm.WEB,
    email: 'admin@example.ro',
    passwordHash: 'hash',
    status: AuthIdentityStatus.ACTIVE,
    superAdmin: false,
    emailVerifiedAt: new Date(),
    passwordSetAt: new Date(),
    lastLoginAt: null,
    failedAttempts: 2,
    lockedUntil: null,
    legacyCognitoUsername: null,
    userId: 'user-id',
    createdOn: new Date(),
    updatedOn: new Date(),
  };

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
    jest.setSystemTime(new Date('2026-10-30T10:00:00Z'));

    identityRepository = {
      registerFailedLogin: jest.fn(),
      update: jest.fn(),
      deleteByUserId: jest.fn(),
    };
    refreshTokenRepository = { revokeAllForIdentity: jest.fn() };

    facade = new AuthIdentityFacade(
      identityRepository as unknown as AuthIdentityRepository,
      {} as AuthTokenRepository,
      refreshTokenRepository as unknown as RefreshTokenRepository,
      {} as AuthIdentityProviderRepository,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('registerFailedLogin asks for a 15-minute lock at the fifth failure', async () => {
    await facade.registerFailedLogin(identity);

    expect(identityRepository.registerFailedLogin).toHaveBeenCalledWith(
      'identity-id',
      AUTH_LOCKOUT.MAX_FAILED_ATTEMPTS,
      new Date('2026-10-30T10:15:00Z'),
    );
    expect(AUTH_LOCKOUT.MAX_FAILED_ATTEMPTS).toBe(5);
  });

  it('registerSuccessfulLogin resets the counter and the lock and records the login', async () => {
    await facade.registerSuccessfulLogin(identity);

    expect(identityRepository.update).toHaveBeenCalledWith('identity-id', {
      failedAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date('2026-10-30T10:00:00Z'),
    });
  });

  it('isLocked is true only while lockedUntil is in the future', () => {
    expect(facade.isLocked(identity)).toBe(false);
    expect(
      facade.isLocked({
        ...identity,
        lockedUntil: new Date('2026-10-30T10:05:00Z'),
      }),
    ).toBe(true);
    expect(
      facade.isLocked({
        ...identity,
        lockedUntil: new Date('2026-10-30T09:55:00Z'),
      }),
    ).toBe(false);
  });

  it('deleteByUserId reaches the repository', async () => {
    identityRepository.deleteByUserId.mockResolvedValue(1);

    await expect(facade.deleteByUserId('user-id')).resolves.toBe(1);
    expect(identityRepository.deleteByUserId).toHaveBeenCalledWith('user-id');
  });

  it('revokeAllSessions passes the manager through', async () => {
    const manager = {} as never;

    await facade.revokeAllSessions('identity-id', 'session-id', manager);

    expect(refreshTokenRepository.revokeAllForIdentity).toHaveBeenCalledWith(
      'identity-id',
      'session-id',
      manager,
    );
  });
});
