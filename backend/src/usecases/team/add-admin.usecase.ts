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
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { DataSource } from 'typeorm';
import { SendInviteUseCase } from './send-invite.usecase';

export interface AddAdminOptions {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// "Add admin" on the Team page: a new admin of the caller's organization and a login waiting for a
// password, then the invite. AUTH_009 when the email already has a web login or an admin profile.
@Injectable()
export class AddAdminUseCase
  implements IUseCaseService<{ userId: string; maskedEmail: string }>
{
  constructor(
    private readonly userFacade: UserFacadeService,
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly sendInvite: SendInviteUseCase,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    caller: IAdminUserModel,
    options: AddAdminOptions,
  ): Promise<{ userId: string; maskedEmail: string }> {
    const taken =
      (await this.authIdentityFacade.findIdentity({
        realm: AuthRealm.WEB,
        email: options.email,
      })) || (await this.userFacade.findAdminUser({ email: options.email }));
    if (taken) throw new AuthException(AuthExceptionCodes.AUTH_009);

    const admin = await this.dataSource.transaction(async (manager) => {
      const created = await this.userFacade.createAdmin(
        {
          name: `${options.firstName.trim()} ${options.lastName.trim()}`,
          email: options.email,
          phone: options.phone.trim(),
          organizationId: caller.organizationId,
        },
        manager,
      );
      await this.authIdentityFacade.createIdentity(
        {
          realm: AuthRealm.WEB,
          email: options.email,
          status: AuthIdentityStatus.PENDING_PASSWORD,
          userId: created.id,
        },
        manager,
      );
      return created;
    });

    const { maskedEmail } = await this.sendInvite.execute(caller, admin.id);
    return { userId: admin.id, maskedEmail };
  }
}
