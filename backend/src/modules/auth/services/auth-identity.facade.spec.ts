import { EntityManager } from 'typeorm';
import { AuthIdentityProviderRepository } from '../repositories/auth-identity-provider.repository';
import { AuthIdentityRepository } from '../repositories/auth-identity.repository';
import { AuthTokenRepository } from '../repositories/auth-token.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { AuthIdentityFacade } from './auth-identity.facade';

describe('AuthIdentityFacade', () => {
  let identityRepository: jest.Mocked<
    Pick<AuthIdentityRepository, 'update' | 'deleteByUserId'>
  >;
  let refreshTokenRepository: jest.Mocked<
    Pick<RefreshTokenRepository, 'revokeAllForIdentity' | 'create'>
  >;
  let facade: AuthIdentityFacade;

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
    jest.setSystemTime(new Date('2026-10-30T10:00:00Z'));

    identityRepository = {
      update: jest.fn(),
      deleteByUserId: jest.fn(),
    };
    refreshTokenRepository = {
      revokeAllForIdentity: jest.fn(),
      create: jest.fn(),
    };

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

  it('createSession records the login on the identity, in the same transaction', async () => {
    const session = { id: 'session-id' };
    refreshTokenRepository.create.mockResolvedValue(session as never);
    const manager = {} as EntityManager;
    const options = {
      identityId: 'identity-id',
      tokenHash: 'hash',
      expiresAt: new Date('2026-11-29T10:00:00Z'),
    };

    await expect(facade.createSession(options, manager)).resolves.toBe(session);

    expect(refreshTokenRepository.create).toHaveBeenCalledWith(
      options,
      manager,
    );
    expect(identityRepository.update).toHaveBeenCalledWith(
      'identity-id',
      { lastLoginAt: new Date('2026-10-30T10:00:00Z') },
      manager,
    );
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
