import { ForbiddenException, Injectable } from '@nestjs/common';
import { OrganizationStatus } from 'src/modules/organization/enums/organization-status.enum';
import { OrganizationExceptionMessages } from 'src/modules/organization/exceptions/exceptions';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';

// Decision 1: until a super admin validates it (and while it is suspended), an NGO cannot be joined, run
// events or have hours logged. 403 ORG_005. The app's list and search hide it in the repository.
@Injectable()
export class OrganizationGateService {
  constructor(private readonly organizationFacade: OrganizationFacadeService) {}

  async assertValidated(organizationId: string): Promise<void> {
    const organization = organizationId
      ? await this.organizationFacade.findOrganization({ id: organizationId })
      : null;
    if (
      !organization ||
      organization.status !== OrganizationStatus.ACTIVE ||
      !organization.validatedAt
    ) {
      throw new ForbiddenException(OrganizationExceptionMessages.ORG_005);
    }
  }
}
