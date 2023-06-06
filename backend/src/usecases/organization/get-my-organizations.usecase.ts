import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { IOrganizationVolunteerModel } from 'src/modules/organization/models/organization-volunteer.models';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';

@Injectable()
export class GetMyOrganizationsUsecase
  implements IUseCaseService<IOrganizationVolunteerModel[]>
{
  constructor(private readonly organizationFacade: OrganizationFacadeService) {}

  public async execute(userId: string): Promise<IOrganizationVolunteerModel[]> {
    return this.organizationFacade.findMyOrganizations(userId);
  }
}
