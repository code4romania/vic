import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { IOrganizationModel } from 'src/modules/organization/models/organization.model';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';

@Injectable()
export class GetMyOrganizationsUsecase
  implements IUseCaseService<IOrganizationModel[]>
{
  constructor(private readonly organizationFacade: OrganizationFacadeService) {}

  public async execute(userId: string): Promise<IOrganizationModel[]> {
    return this.organizationFacade.findMyOrganizations(userId);
  }
}
