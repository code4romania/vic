import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import {
  AuthException,
  AuthExceptionCodes,
} from 'src/modules/auth/exceptions/exceptions';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { PasswordService } from 'src/modules/auth/services/password.service';
import {
  SessionClient,
  SessionService,
  SessionTokens,
} from 'src/modules/auth/services/session.service';
import { OrganizationStatus } from 'src/modules/organization/enums/organization-status.enum';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';

export interface LoginResult {
  tokens: SessionTokens;
  admin?: IAdminUserModel & { superAdmin: boolean }; // web only
}

// Never sends email: an old or wrong password just fails.
@Injectable()
export class LoginUseCase implements IUseCaseService<LoginResult> {
  // Verified when there is nothing to verify, so "no such login" takes as long as "wrong password".
  private dummyHash: Promise<string>;

  constructor(
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly passwordService: PasswordService,
    private readonly sessionService: SessionService,
    private readonly userFacade: UserFacadeService,
    private readonly organizationFacade: OrganizationFacadeService,
  ) {}

  async execute(
    realm: AuthRealm,
    email: string,
    password: string,
    client: SessionClient = {},
  ): Promise<LoginResult> {
    const identity = await this.authIdentityFacade.findIdentity({
      realm,
      email,
    });

    // A volunteer on the web login is sent to the app, before the dummy-hash branch (decisions R19).
    if (!identity && realm === AuthRealm.WEB) {
      const volunteer = await this.authIdentityFacade.findIdentity({
        realm: AuthRealm.MOBILE,
        email,
      });
      if (volunteer) throw new AuthException(AuthExceptionCodes.AUTH_012);
    }

    // Unknown email, or a migrated login that has no password yet: same answer, same timing.
    if (!identity || !identity.passwordHash) {
      await this.passwordService.verify(await this.getDummyHash(), password);
      throw new AuthException(AuthExceptionCodes.AUTH_001);
    }

    if (identity.status === AuthIdentityStatus.DISABLED) {
      throw new AuthException(AuthExceptionCodes.AUTH_004);
    }

    const admin =
      realm === AuthRealm.WEB
        ? await this.findActiveAdmin(identity.userId)
        : undefined;

    if (this.authIdentityFacade.isLocked(identity)) {
      throw new AuthException(AuthExceptionCodes.AUTH_002);
    }

    if (!(await this.passwordService.verify(identity.passwordHash, password))) {
      await this.authIdentityFacade.registerFailedLogin(identity);
      throw new AuthException(AuthExceptionCodes.AUTH_001);
    }

    if (!identity.emailVerifiedAt) {
      throw new AuthException(AuthExceptionCodes.AUTH_003);
    }

    await this.authIdentityFacade.registerSuccessfulLogin(identity);
    const tokens = await this.sessionService.createSession(
      identity,
      realm,
      client,
    );

    return admin
      ? { tokens, admin: { ...admin, superAdmin: identity.superAdmin } }
      : { tokens };
  }

  // AUTH_004 for an admin of a suspended NGO (decisions R8); AUTH_001 when the admin row is missing.
  private async findActiveAdmin(userId: string): Promise<IAdminUserModel> {
    // Checked before the lookup: TypeORM drops an undefined where key and would return the first admin.
    const admin = userId
      ? await this.userFacade.findAdminUser({ id: userId })
      : null;
    if (!admin) throw new AuthException(AuthExceptionCodes.AUTH_001);

    const organization = admin.organizationId
      ? await this.organizationFacade.findOrganization({
          id: admin.organizationId,
        })
      : null;
    if (organization?.status === OrganizationStatus.SUSPENDED) {
      throw new AuthException(AuthExceptionCodes.AUTH_004);
    }

    return admin;
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= this.passwordService.hash(
      `dummy-${Math.random()}-${Date.now()}`,
    );
    return this.dummyHash;
  }
}
