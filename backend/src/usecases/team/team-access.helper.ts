import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationExceptionMessages } from 'src/modules/organization/exceptions/exceptions';
import { UserExceptionMessages } from 'src/modules/user/exceptions/exceptions';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';

// Team actions only reach admins of the caller's own organization (403 ORG_008).
@Injectable()
export class TeamAccessHelper {
  constructor(private readonly userFacade: UserFacadeService) {}

  async colleague(
    caller: Pick<IAdminUserModel, 'organizationId'>,
    targetUserId: string,
  ): Promise<IAdminUserModel> {
    // Checked before the lookup: TypeORM drops an undefined where key and would return the first admin.
    const target = targetUserId
      ? await this.userFacade.findAdminUser({ id: targetUserId })
      : null;
    if (!target) throw new NotFoundException(UserExceptionMessages.USER_001);
    if (
      !caller.organizationId ||
      target.organizationId !== caller.organizationId
    ) {
      throw new ForbiddenException(OrganizationExceptionMessages.ORG_008);
    }
    return target;
  }
}
