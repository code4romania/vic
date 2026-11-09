import { TokenPurpose } from 'src/api/auth/presenters/token-info.presenter';
import {
  AuthIdentityStatus,
  AuthProvider,
  AuthRealm,
  AuthTokenForm,
  AuthTokenType,
} from 'src/modules/auth/enums/auth.enums';
import {
  AuthException,
  AuthExceptionCodes,
} from 'src/modules/auth/exceptions/exceptions';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { SessionService } from 'src/modules/auth/services/session.service';
import { SocialTokenVerifierService } from 'src/modules/auth/services/social/social-token-verifier.service';
import { DataSource } from 'typeorm';
import { LoginWithCodeUseCase } from './login-with-code.usecase';
import { LoginWithLinkUseCase } from './login-with-link.usecase';
import { RequestLoginUseCase } from './request-login.usecase';
import { ResendVerificationUseCase } from './resend-verification.usecase';
import { CompleteLoginHelper } from './complete-login.helper';
import { WebSessionHelper } from './web-session.helper';
import { OneTimeTokenService } from 'src/modules/auth/services/one-time-token.service';
import { AuthRateLimitService } from 'src/modules/auth/services/auth-rate-limit.service';
import { AuthMailerService } from 'src/modules/auth/services/auth-mailer.service';
import { SocialLoginUseCase } from './social-login.usecase';
import { tokenPurpose } from './token-purpose.helper';

const identity = (
  overrides: Partial<IAuthIdentityModel> = {},
): IAuthIdentityModel => ({
  id: 'identity-id',
  realm: AuthRealm.WEB,
  email: 'ana@example.ro',
  status: AuthIdentityStatus.ACTIVE,
  superAdmin: false,
  emailVerifiedAt: new Date(),
  lastLoginAt: null,
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

describe('RequestLoginUseCase (VIC 2.0, #514)', () => {
  let facade: { findIdentity: jest.Mock; createIdentity: jest.Mock };
  let tokens: { issue: jest.Mock; maskEmail: jest.Mock };
  let rateLimit: { assertCanIssue: jest.Mock };
  let mailer: { send: jest.Mock; loginLinkUrl: jest.Mock };
  let resendVerification: { execute: jest.Mock };
  let useCase: RequestLoginUseCase;

  beforeEach(() => {
    facade = { findIdentity: jest.fn(), createIdentity: jest.fn() };
    tokens = {
      issue: jest.fn().mockResolvedValue({ secret: 'secret' }),
      maskEmail: jest.fn().mockReturnValue('a•••@example.ro'),
    };
    rateLimit = { assertCanIssue: jest.fn() };
    mailer = {
      send: jest.fn(),
      loginLinkUrl: jest.fn((secret: string) => `https://vic.test/${secret}`),
    };
    resendVerification = { execute: jest.fn() };
    useCase = new RequestLoginUseCase(
      facade as unknown as AuthIdentityFacade,
      tokens as unknown as OneTimeTokenService,
      rateLimit as unknown as AuthRateLimitService,
      mailer as unknown as AuthMailerService,
      resendVerification as unknown as ResendVerificationUseCase,
    );
  });

  it('web: an admin gets a login link', async () => {
    facade.findIdentity.mockResolvedValue(identity());

    await useCase.execute(AuthRealm.WEB, 'ana@example.ro');

    expect(tokens.issue).toHaveBeenCalledWith({
      identity: expect.objectContaining({ id: 'identity-id' }),
      type: AuthTokenType.LOGIN,
      form: AuthTokenForm.LINK,
    });
    expect(mailer.send).toHaveBeenCalledTimes(1);
  });

  it('web: an unknown, disabled or rate-limited email gets the same answer and no email', async () => {
    facade.findIdentity.mockResolvedValue(null);
    await expect(
      useCase.execute(AuthRealm.WEB, 'nobody@example.ro'),
    ).resolves.toEqual({ maskedEmail: 'a•••@example.ro' });

    facade.findIdentity.mockResolvedValue(
      identity({ status: AuthIdentityStatus.DISABLED }),
    );
    await useCase.execute(AuthRealm.WEB, 'ana@example.ro');

    facade.findIdentity.mockResolvedValue(identity());
    rateLimit.assertCanIssue.mockRejectedValue(
      new AuthException(AuthExceptionCodes.AUTH_010),
    );
    await useCase.execute(AuthRealm.WEB, 'ana@example.ro');

    expect(mailer.send).not.toHaveBeenCalled();
  });

  it('web: a volunteer email is sent to the app (AUTH_012)', async () => {
    facade.findIdentity.mockImplementation(async ({ realm }) =>
      realm === AuthRealm.MOBILE ? identity({ realm }) : null,
    );

    await rejectsWith(
      useCase.execute(AuthRealm.WEB, 'ana@example.ro'),
      AuthExceptionCodes.AUTH_012,
    );
  });

  it('web: an admin who never confirmed gets the NGO confirmation link again', async () => {
    facade.findIdentity.mockResolvedValue(identity({ emailVerifiedAt: null }));

    await useCase.execute(AuthRealm.WEB, 'ana@example.ro');

    expect(resendVerification.execute).toHaveBeenCalledWith(
      AuthRealm.WEB,
      'ana@example.ro',
    );
    expect(tokens.issue).not.toHaveBeenCalled();
  });

  it('mobile: an unknown email gets a pending login and a 6-digit code', async () => {
    facade.findIdentity.mockResolvedValue(null);
    facade.createIdentity.mockResolvedValue(
      identity({ realm: AuthRealm.MOBILE, status: AuthIdentityStatus.PENDING }),
    );

    await useCase.execute(AuthRealm.MOBILE, 'ana@example.ro');

    expect(facade.createIdentity).toHaveBeenCalledWith({
      realm: AuthRealm.MOBILE,
      email: 'ana@example.ro',
      status: AuthIdentityStatus.PENDING,
    });
    expect(tokens.issue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: AuthTokenType.LOGIN,
        form: AuthTokenForm.CODE,
      }),
    );
  });

  it('mobile: a disabled login is AUTH_004 and a rate limit is shown (AUTH_010)', async () => {
    facade.findIdentity.mockResolvedValue(
      identity({
        realm: AuthRealm.MOBILE,
        status: AuthIdentityStatus.DISABLED,
      }),
    );
    await rejectsWith(
      useCase.execute(AuthRealm.MOBILE, 'ana@example.ro'),
      AuthExceptionCodes.AUTH_004,
    );

    facade.findIdentity.mockResolvedValue(
      identity({ realm: AuthRealm.MOBILE }),
    );
    rateLimit.assertCanIssue.mockRejectedValue(
      new AuthException(AuthExceptionCodes.AUTH_010),
    );
    await rejectsWith(
      useCase.execute(AuthRealm.MOBILE, 'ana@example.ro'),
      AuthExceptionCodes.AUTH_010,
    );
    expect(mailer.send).not.toHaveBeenCalled();
  });
});

describe('LoginWithCodeUseCase / LoginWithLinkUseCase (VIC 2.0, #514)', () => {
  const completeLogin = {
    consume: jest.fn(async (found: IAuthIdentityModel) => ({
      ...found,
      status: AuthIdentityStatus.ACTIVE,
    })),
  };

  it('code: verifies the code, uses it and starts a mobile session', async () => {
    const volunteer = identity({
      realm: AuthRealm.MOBILE,
      status: AuthIdentityStatus.PENDING,
    });
    const tokens = {
      verifyCode: jest.fn().mockResolvedValue({ id: 'token-id' }),
    };
    const sessions = {
      createSession: jest.fn().mockResolvedValue({ accessToken: 'a' }),
    };
    const useCase = new LoginWithCodeUseCase(
      {
        findIdentity: jest.fn().mockResolvedValue(volunteer),
      } as unknown as AuthIdentityFacade,
      tokens as unknown as OneTimeTokenService,
      completeLogin as unknown as CompleteLoginHelper,
      sessions as unknown as SessionService,
    );

    await useCase.execute('ana@example.ro', '012345');

    expect(tokens.verifyCode).toHaveBeenCalledWith(
      volunteer,
      AuthTokenType.LOGIN,
      '012345',
    );
    expect(sessions.createSession).toHaveBeenCalledWith(
      expect.objectContaining({ status: AuthIdentityStatus.ACTIVE }),
      AuthRealm.MOBILE,
      {},
    );
  });

  it('code: an unknown email is AUTH_005, a disabled login AUTH_004', async () => {
    const findIdentity = jest.fn().mockResolvedValue(null);
    const useCase = new LoginWithCodeUseCase(
      { findIdentity } as unknown as AuthIdentityFacade,
      {} as OneTimeTokenService,
      completeLogin as unknown as CompleteLoginHelper,
      {} as SessionService,
    );

    await rejectsWith(
      useCase.execute('x@example.ro', '012345'),
      AuthExceptionCodes.AUTH_005,
    );
    findIdentity.mockResolvedValue(
      identity({
        realm: AuthRealm.MOBILE,
        status: AuthIdentityStatus.DISABLED,
      }),
    );
    await rejectsWith(
      useCase.execute('x@example.ro', '012345'),
      AuthExceptionCodes.AUTH_004,
    );
  });

  it('link: only a web login or invite link logs in; a confirmation link or a mobile login does not', async () => {
    const peekLink = jest.fn();
    const webSession = { start: jest.fn().mockResolvedValue({}) };
    const useCase = new LoginWithLinkUseCase(
      { peekLink } as unknown as OneTimeTokenService,
      completeLogin as unknown as CompleteLoginHelper,
      webSession as unknown as WebSessionHelper,
    );

    peekLink.mockResolvedValue({
      type: AuthTokenType.VERIFY_EMAIL,
      identity: identity(),
    });
    await rejectsWith(useCase.execute('s'), AuthExceptionCodes.AUTH_005);

    peekLink.mockResolvedValue({
      type: AuthTokenType.LOGIN,
      identity: identity({ realm: AuthRealm.MOBILE }),
    });
    await rejectsWith(useCase.execute('s'), AuthExceptionCodes.AUTH_005);

    peekLink.mockResolvedValue({
      type: AuthTokenType.INVITE,
      identity: identity({ status: AuthIdentityStatus.DISABLED }),
    });
    await rejectsWith(useCase.execute('s'), AuthExceptionCodes.AUTH_004);

    peekLink.mockResolvedValue({
      type: AuthTokenType.LOGIN,
      identity: identity(),
    });
    await useCase.execute('s');
    expect(webSession.start).toHaveBeenCalledTimes(1);
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
        status: AuthIdentityStatus.PENDING,
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
    [AuthTokenType.LOGIN, null, TokenPurpose.LOGIN],
    [AuthTokenType.VERIFY_EMAIL, null, TokenPurpose.VERIFY_EMAIL],
  ])('%s sent by %p is %s', (type, sentById, purpose) => {
    expect(tokenPurpose({ type, sentById })).toBe(purpose);
  });
});
