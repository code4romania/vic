import { Role } from 'src/common/enums/role.enum';
import { OrganizationStatus } from 'src/modules/organization/enums/organization-status.enum';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { createTestAuthConfig } from '../../../../test/utils/auth-test-config';
import { AuthIdentityStatus, AuthRealm } from '../enums/auth.enums';
import { AuthExceptionCodes } from '../exceptions/exceptions';
import { IAuthIdentityModel } from '../models/auth-identity.model';
import { AuthIdentityFacade } from '../services/auth-identity.facade';
import { MobileJwtStrategy } from './jwt-mobile.strategy';
import { WebJwtStrategy } from './jwt-web.strategy';

const identity = (
  overrides: Partial<IAuthIdentityModel> = {},
): IAuthIdentityModel => ({
  id: 'identity-id',
  realm: AuthRealm.WEB,
  email: 'person@example.ro',
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

const payload = { sub: 'identity-id', sid: 'session-id' };

describe('JWT strategies', () => {
  let facade: { findIdentity: jest.Mock };
  let users: { findAdminUser: jest.Mock; findRegularUser: jest.Mock };
  let organizations: { findOrganization: jest.Mock };
  const authConfig = createTestAuthConfig();

  beforeEach(() => {
    facade = { findIdentity: jest.fn() };
    users = { findAdminUser: jest.fn(), findRegularUser: jest.fn() };
    organizations = { findOrganization: jest.fn() };
  });

  describe('WebJwtStrategy', () => {
    let strategy: WebJwtStrategy;
    const admin = {
      id: 'user-id',
      name: 'Ana Admin',
      email: 'person@example.ro',
      organizationId: 'org-id',
    };

    beforeEach(() => {
      strategy = new WebJwtStrategy(
        facade as unknown as AuthIdentityFacade,
        users as unknown as UserFacadeService,
        organizations as unknown as OrganizationFacadeService,
        authConfig,
      );
      users.findAdminUser.mockResolvedValue(admin);
      organizations.findOrganization.mockResolvedValue({
        id: 'org-id',
        status: OrganizationStatus.ACTIVE,
      });
    });

    it('returns the admin with role, superAdmin, identityId and sessionId', async () => {
      facade.findIdentity.mockResolvedValue(identity({ superAdmin: true }));

      await expect(strategy.validate(payload)).resolves.toEqual({
        ...admin,
        role: Role.ADMIN,
        superAdmin: true,
        identityId: 'identity-id',
        sessionId: 'session-id',
      });
      expect(facade.findIdentity).toHaveBeenCalledWith({ id: 'identity-id' });
      expect(users.findAdminUser).toHaveBeenCalledWith({ id: 'user-id' });
    });

    it.each([
      ['an unknown identity', null],
      [
        'a disabled identity',
        identity({ status: AuthIdentityStatus.DISABLED }),
      ],
      [
        'an identity still waiting for a password',
        identity({ status: AuthIdentityStatus.PENDING_PASSWORD }),
      ],
      ['a mobile identity', identity({ realm: AuthRealm.MOBILE })],
    ])('rejects %s', async (_, found) => {
      facade.findIdentity.mockResolvedValue(found);

      await expect(strategy.validate(payload)).resolves.toBeNull();
    });

    it('rejects a null userId without looking up any admin', async () => {
      facade.findIdentity.mockResolvedValue(identity({ userId: null }));

      await expect(strategy.validate(payload)).resolves.toBeNull();
      expect(users.findAdminUser).not.toHaveBeenCalled();
    });

    it('rejects an identity whose admin row is gone', async () => {
      facade.findIdentity.mockResolvedValue(identity());
      users.findAdminUser.mockResolvedValue(null);

      await expect(strategy.validate(payload)).resolves.toBeNull();
    });

    it('refuses an admin of a suspended organization with AUTH_004', async () => {
      facade.findIdentity.mockResolvedValue(identity());
      organizations.findOrganization.mockResolvedValue({
        id: 'org-id',
        status: OrganizationStatus.SUSPENDED,
      });

      await expect(strategy.validate(payload)).rejects.toMatchObject({
        response: { code_error: AuthExceptionCodes.AUTH_004 },
        status: 403,
      });
    });
  });

  describe('MobileJwtStrategy', () => {
    let strategy: MobileJwtStrategy;

    beforeEach(() => {
      strategy = new MobileJwtStrategy(
        facade as unknown as AuthIdentityFacade,
        users as unknown as UserFacadeService,
        authConfig,
      );
    });

    it('returns the volunteer with role, identityId and sessionId', async () => {
      const volunteer = { id: 'user-id', firstName: 'Elena' };
      facade.findIdentity.mockResolvedValue(
        identity({ realm: AuthRealm.MOBILE }),
      );
      users.findRegularUser.mockResolvedValue(volunteer);

      await expect(strategy.validate(payload)).resolves.toEqual({
        ...volunteer,
        role: Role.VOLUNTEER,
        identityId: 'identity-id',
        sessionId: 'session-id',
      });
      expect(users.findRegularUser).toHaveBeenCalledWith({ id: 'user-id' });
    });

    it('a login with no profile yet gets the stub and never queries the user table', async () => {
      facade.findIdentity.mockResolvedValue(
        identity({ realm: AuthRealm.MOBILE, userId: null }),
      );

      await expect(strategy.validate(payload)).resolves.toEqual({
        identityId: 'identity-id',
        sessionId: 'session-id',
        email: 'person@example.ro',
        role: Role.VOLUNTEER,
      });
      expect(users.findRegularUser).not.toHaveBeenCalled();
    });

    it.each([
      ['an unknown identity', null],
      [
        'a disabled identity',
        identity({
          realm: AuthRealm.MOBILE,
          status: AuthIdentityStatus.DISABLED,
        }),
      ],
      ['a web identity', identity({ realm: AuthRealm.WEB })],
    ])('rejects %s', async (_, found) => {
      facade.findIdentity.mockResolvedValue(found);

      await expect(strategy.validate(payload)).resolves.toBeNull();
    });

    it('rejects an identity whose profile row is gone', async () => {
      facade.findIdentity.mockResolvedValue(
        identity({ realm: AuthRealm.MOBILE }),
      );
      users.findRegularUser.mockResolvedValue(null);

      await expect(strategy.validate(payload)).resolves.toBeNull();
    });
  });
});
