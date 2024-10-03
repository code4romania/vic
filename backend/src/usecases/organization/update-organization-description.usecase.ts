import { Injectable } from '@nestjs/common';
import { ObjectDiff } from 'src/common/helpers/object-diff';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { IOrganizationModel } from 'src/modules/organization/models/organization.model';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetOrganizationUseCaseService } from './get-organization.usecase';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';

@Injectable()
export class UpdateOrganizationDescriptionUseCaseService
  implements IUseCaseService<IOrganizationModel>
{
  constructor(
    private readonly organizationService: OrganizationFacadeService,
    private readonly getOrganizationUseCaseService: GetOrganizationUseCaseService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute(
    description: string,
    admin: IAdminUserModel,
  ): Promise<IOrganizationModel> {
    // 1. Find if the organization to be updated, exists
    const toUpdate = await this.getOrganizationUseCaseService.execute(
      admin.organizationId,
    );

    // 2. Update
    const updated =
      await this.organizationService.updateOrganizationDescription(
        admin.organizationId,
        description,
      );

    // 3. Track action
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.UPDATE_ORGANIZATION_PROFILE,
      {
        organizationId: toUpdate.id,
        organizationName: toUpdate.name,
      },
      admin,
      admin.organizationId,
      ObjectDiff.diff(toUpdate, updated),
    );

    // return organization with updated fields
    return updated;
  }
}
