import { Injectable } from '@nestjs/common';
import { ObjectDiff } from 'src/common/helpers/object-diff';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { UpdateResourceEvent } from 'src/modules/actions-archive/events/base.events';
import { ORGANIZATION_PROFILE_EVENTS } from 'src/modules/actions-archive/modules/organization-profile/organization-profile.model';
import { ORGANIZATION_STRUCTURE_EVENTS } from 'src/modules/actions-archive/modules/organization-structure/organization-structure.model';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/organization-structure.facade';
import { IOrganizationModel } from 'src/modules/organization/models/organization.model';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetOrganizationUseCaseService } from './get-organization.usecase';

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

    // 3. Track event
    this.actionsArchiveFacade.trackEvent(
      ORGANIZATION_PROFILE_EVENTS.UPDATE,
      new UpdateResourceEvent(
        updated.id,
        admin,
        ObjectDiff.diff(toUpdate, updated),
      ),
    );

    // return organization with updated fields
    return updated;
  }
}
