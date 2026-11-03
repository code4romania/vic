import { TokenPurpose } from 'src/api/auth/presenters/token-info.presenter';
import {
  AuthIdentityStatus,
  AuthProvider,
  AuthRealm,
  AuthTokenType,
} from 'src/modules/auth/enums/auth.enums';
import { AuthExceptionCodes } from 'src/modules/auth/exceptions/exceptions';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { PasswordService } from 'src/modules/auth/services/password.service';
import { SessionService } from 'src/modules/auth/services/session.service';
import { SocialTokenVerifierService } from 'src/modules/auth/services/social/social-token-verifier.service';
import { OrganizationStatus } from 'src/modules/organization/enums/organization-status.enum';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { DataSource } from 'typeorm';
import { LoginUseCase } from './login.usecase';
import { SocialLoginUseCase } from './social-login.usecase';
import { tokenPurpose } from './token-purpose.helper';

const identity = (
  overrides: Partial<IAuthIdentityModel> = {},
): IAuthIdentityModel => ({
  id: 'identity-id',
  realm: AuthRealm.WEB,
  email: 'ana@example.ro',
  passwordHash: 'hash',
  status: AuthIdentityStatus.ACTIVE,
  superAdmin: false,
  emailVerifiedAt: new Date(),
  passwordSetAt: new Date(),
  lastLoginAt: null,
  failedAttempts: 0,
  lockedUntil: null,
  legacyCognitoUsername: null,
  userId: 'user-id',
  createdOn: new Date(),
  updatedOn: new Date(),
  ...overrides,
});

const rejectsWith = (
  promise: Promise<unknown>,
  code: AuthExceptionCodes,
): Promise<void> =>
  expect(promise).rejects.toMatchObject({ response: { code_error: code } });

describe('LoginUseCase (branch order)', () => {
  let facade: {
    findIdentity: jest.Mock;
    registerFailedLogin: jest.Mock;
    registerSuccessfulLogin: jest.Mock;
    isLocked: jest.Mock;
  };
  let passwords: { verify: jest.Mock; hash: jest.Mock };
  let sessions: { createSession: jest.Mock };
  let users: { findAdminUser: jest.Mock };
  let organizations: { findOrganization: jest.Mock };
  let useCase: LoginUseCase;

  const login = (realm = AuthRealm.WEB): Promise<unknown> =>
    useCase.execute(realm, 'ana@example.ro', 'Volunteer#2026');

  beforeEach(() => {
    facade = {
      findIdentity: jest.fn(),
      registerFailedLogin: jest.fn(),
      registerSuccessfulLogin: jest.fn(),
      isLocked: jest.fn((found: IAuthIdentityModel) => !!found.lockedUntil),
    };
    passwords = {
      verify: jest.fn().mockResolvedValue(true),
      hash: jest.fn().mockResolvedValue('dummy-hash'),
    };
    sessions = {
      createSession: jest.fn().mockResolvedValue({ accessToken: 'token' }),
    };
    users = {
      findAdminUser: jest
        .fn()
        .mockResolvedValue({ id: 'user-id', organizationId: 'org-id' }),
    };
    organizations = {
      findOrganization: jest
        .fn()
        .mockResolvedValue({ status: OrganizationStatus.ACTIVE }),
    };
    useCase = new LoginUseCase(
      facade as unknown as AuthIdentityFacade,
      passwords as unknown as PasswordService,
      sessions as unknown as SessionService,
      users as unknown as UserFacadeService,
      organizations as unknown as OrganizationFacadeService,
    );
  });

  it('web login for an email that only has a mobile login: AUTH_012, without the dummy hash', async () => {
    facade.findIdentity.mockImplementation(async ({ realm }) =>
      realm === AuthRealm.MOBILE ? identity({ realm }) : null,
    );

    await rejectsWith(login(), AuthExceptionCodes.AUTH_012);
    expect(passwords.verify).not.toHaveBeenCalled();
  });

  it('unknown email: AUTH_001 after verifying against the dummy hash', async () => {
    facade.findIdentity.mockResolvedValue(null);

    await rejectsWith(login(AuthRealm.MOBILE), AuthExceptionCodes.AUTH_001);
    expect(passwords.verify).toHaveBeenCalledWith(
      'dummy-hash',
      'Volunteer#2026',
    );
  });

  it('a migrated login with no password yet: AUTH_001 the same way', async () => {
    facade.findIdentity.mockResolvedValue(
      identity({
        passwordHash: null,
        status: AuthIdentityStatus.PENDING_PASSWORD,
      }),
    );

    await rejectsWith(login(), AuthExceptionCodes.AUTH_001);
    expect(passwords.verify).toHaveBeenCalledWith(
      'dummy-hash',
      'Volunteer#2026',
    );
    expect(facade.registerFailedLogin).not.toHaveBeenCalled();
  });

  it('disabled: AUTH_004', async () => {
    facade.findIdentity.mockResolvedValue(
      identity({ status: AuthIdentityStatus.DISABLED }),
    );

    await rejectsWith(login(), AuthExceptionCodes.AUTH_004);
  });

  it('an admin of a suspended NGO: AUTH_004', async () => {
    facade.findIdentity.mockResolvedValue(identity());
    organizations.findOrganization.mockResolvedValue({
      status: OrganizationStatus.SUSPENDED,
    });

    await rejectsWith(login(), AuthExceptionCodes.AUTH_004);
  });

  it('locked: AUTH_002 even with the right password, and no attempt counted', async () => {
    facade.findIdentity.mockResolvedValue(
      identity({ lockedUntil: new Date(Date.now() + 60000) }),
    );

    await rejectsWith(login(), AuthExceptionCodes.AUTH_002);
    expect(passwords.verify).not.toHaveBeenCalled();
  });

  it('wrong password: counts the failure, AUTH_001', async () => {
    const found = identity();
    facade.findIdentity.mockResolvedValue(found);
    passwords.verify.mockResolvedValue(false);

    await rejectsWith(login(), AuthExceptionCodes.AUTH_001);
    expect(facade.registerFailedLogin).toHaveBeenCalledWith(found);
  });

  it('right password, email not confirmed: AUTH_003 (checked after the password)', async () => {
    facade.findIdentity.mockResolvedValue(identity({ emailVerifiedAt: null }));

    await rejectsWith(login(AuthRealm.MOBILE), AuthExceptionCodes.AUTH_003);
    expect(passwords.verify).toHaveBeenCalled();
    expect(sessions.createSession).not.toHaveBeenCalled();
  });

  it('success: resets the counters, creates a session and returns the admin on the web', async () => {
    const found = identity({ superAdmin: true });
    facade.findIdentity.mockResolvedValue(found);

    await expect(login()).resolves.toEqual({
      tokens: { accessToken: 'token' },
      admin: { id: 'user-id', organizationId: 'org-id', superAdmin: true },
    });
    expect(facade.registerSuccessfulLogin).toHaveBeenCalledWith(found);
    expect(sessions.createSession).toHaveBeenCalledWith(
      found,
      AuthRealm.WEB,
      {},
    );
  });

  it('a web login whose admin row is missing: AUTH_001, never the first admin', async () => {
    facade.findIdentity.mockResolvedValue(identity({ userId: null }));

    await rejectsWith(login(), AuthExceptionCodes.AUTH_001);
    expect(users.findAdminUser).not.toHaveBeenCalled();
  });
});

describe('SocialLoginUseCase', () => {
  let verifier: { verify: jest.Mock };
  let facade: {
    findProviderLink: jest.Mock;
    findIdentity: jest.Mock;
    createIdentity: jest.Mock;
    updateIdentity: jest.Mock;
    linkProvider: jest.Mock;
  };
  let sessions: { createSession: jest.Mock };
  let useCase: SocialLoginUseCase;
  const manager = { transactional: true };
  const dataSource = {
    transaction: (work: (m: unknown) => unknown) => work(manager),
  } as unknown as DataSource;

  const signIn = (): Promise<unknown> =>
    useCase.execute(AuthProvider.GOOGLE, 'google-token');

  beforeEach(() => {
    verifier = {
      verify: jest.fn().mockResolvedValue({
        subject: 'g-1',
        email: 'elena@example.ro',
        emailVerified: true,
      }),
    };
    facade = {
      findProviderLink: jest.fn().mockResolvedValue(null),
      findIdentity: jest.fn().mockResolvedValue(null),
      createIdentity: jest.fn(async (options) =>
        identity({ ...options, id: 'new-id' }),
      ),
      updateIdentity: jest.fn(async (id, options) =>
        identity({ id, ...options }),
      ),
      linkProvider: jest.fn(),
    };
    sessions = {
      createSession: jest.fn().mockResolvedValue({ accessToken: 't' }),
    };
    useCase = new SocialLoginUseCase(
      verifier as unknown as SocialTokenVerifierService,
      facade as unknown as AuthIdentityFacade,
      sessions as unknown as SessionService,
      dataSource,
    );
  });

  it('an unverified email: AUTH_013', async () => {
    verifier.verify.mockResolvedValue({
      subject: 'g-1',
      email: 'elena@example.ro',
      emailVerified: false,
    });

    await rejectsWith(signIn(), AuthExceptionCodes.AUTH_013);
  });

  it('an unknown email: creates an active login without a password and links the provider', async () => {
    await signIn();

    expect(facade.createIdentity).toHaveBeenCalledWith(
      expect.objectContaining({
        realm: AuthRealm.MOBILE,
        email: 'elena@example.ro',
        status: AuthIdentityStatus.ACTIVE,
        emailVerifiedAt: expect.any(Date),
      }),
      manager,
    );
    expect(facade.createIdentity.mock.calls[0][0]).not.toHaveProperty(
      'passwordHash',
    );
    expect(facade.linkProvider).toHaveBeenCalledWith(
      {
        identityId: 'new-id',
        provider: AuthProvider.GOOGLE,
        subject: 'g-1',
        emailAtLink: 'elena@example.ro',
      },
      manager,
    );
    expect(sessions.createSession).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'new-id' }),
      AuthRealm.MOBILE,
      {},
    );
  });

  it('a migrated volunteer still waiting for a password: active and confirmed in the linking transaction (decisions R4)', async () => {
    facade.findIdentity.mockResolvedValue(
      identity({
        id: 'migrated',
        realm: AuthRealm.MOBILE,
        passwordHash: null,
        status: AuthIdentityStatus.PENDING_PASSWORD,
        emailVerifiedAt: null,
      }),
    );

    await signIn();

    expect(facade.updateIdentity).toHaveBeenCalledWith(
      'migrated',
      { status: AuthIdentityStatus.ACTIVE, emailVerifiedAt: expect.any(Date) },
      manager,
    );
    expect(facade.linkProvider).toHaveBeenCalledWith(
      expect.objectContaining({ identityId: 'migrated' }),
      manager,
    );
  });

  it('a known provider link: reuses it, links nothing new, changes nothing', async () => {
    facade.findProviderLink.mockResolvedValue({ identityId: 'linked' });
    facade.findIdentity.mockResolvedValue(
      identity({ id: 'linked', realm: AuthRealm.MOBILE }),
    );

    await signIn();

    expect(facade.findIdentity).toHaveBeenCalledWith({ id: 'linked' });
    expect(facade.linkProvider).not.toHaveBeenCalled();
    expect(facade.updateIdentity).not.toHaveBeenCalled();
  });

  it('a disabled login: AUTH_004, no session', async () => {
    facade.findIdentity.mockResolvedValue(
      identity({
        realm: AuthRealm.MOBILE,
        status: AuthIdentityStatus.DISABLED,
      }),
    );

    await rejectsWith(signIn(), AuthExceptionCodes.AUTH_004);
    expect(sessions.createSession).not.toHaveBeenCalled();
  });
});

describe('tokenPurpose (decisions R16)', () => {
  it.each([
    [AuthTokenType.INVITE, null, TokenPurpose.TRANSITION],
    [AuthTokenType.INVITE, 'admin-id', TokenPurpose.INVITE],
    [AuthTokenType.RESET_PASSWORD, null, TokenPurpose.RESET],
    [AuthTokenType.VERIFY_EMAIL, null, TokenPurpose.VERIFY_EMAIL],
  ])('%s sent by %p is %s', (type, sentById, purpose) => {
    expect(tokenPurpose({ type, sentById })).toBe(purpose);
  });
});
