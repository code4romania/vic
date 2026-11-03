import { Injectable } from '@nestjs/common';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { IOrganizationModel } from 'src/modules/organization/models/organization.model';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { OrganizationFilesHelper } from './organization-files.helper';

export type PendingOrganization = IOrganizationModel & {
  firstAdmin: IAdminUserModel;
};

// Super admins: NGOs confirmed by their first admin and not validated yet, oldest first.
@Injectable()
export class ListPendingValidationUseCase
  implements IUseCaseService<PendingOrganization[]>
{
  constructor(
    private readonly organizationFacade: OrganizationFacadeService,
    private readonly userFacade: UserFacadeService,
    private readonly files: OrganizationFilesHelper,
  ) {}

  async execute(): Promise<PendingOrganization[]> {
    const organizations = await this.organizationFacade.findPendingValidation();

    return Promise.all(
      organizations.map(async (organization) => {
        // The first admin is the one who registered the NGO.
        const admins = await this.userFacade.findManyAdminUsers({
          organizationId: organization.id,
          limit: 1,
          page: 1,
          orderBy: 'createdOn',
          orderDirection: OrderDirection.ASC,
        });
        return {
          ...(await this.files.withStatuteLink(organization)),
          firstAdmin: admins.items[0] ?? null,
        };
      }),
    );
  }
}
