import { Injectable, Logger } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { OngHubExceptionMessages } from 'src/modules/onghub/exceptions/exceptions';
import { OngHubService } from 'src/modules/onghub/services/ong-hub.service';
import { IOrganizationModel } from 'src/modules/organization/models/organization.model';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';

@Injectable()
export class SyncWithOngHubUseCaseService
  implements IUseCaseService<IOrganizationModel>
{
  private readonly logger = new Logger(SyncWithOngHubUseCaseService.name);

  constructor(
    private readonly ongHubService: OngHubService,
    private readonly organizationService: OrganizationFacadeService,
    private readonly exceptionService: ExceptionsService,
  ) {}

  /**
   * Synchronizes the organization data with ONG Hub.
   *
   * @param organizationId - The ID of the organization to be synchronized.
   * @param token - The authentication token for ONG Hub which is the same as the one from VIC because we share the same Cognito User Pool.
   * @returns A Promise that resolves to the updated IOrganizationModel.
   * @throws InternalServerErrorException if there's an error fetching data from ONG Hub or updating the organization.
   */
  async execute(
    organizationId: string,
    token: string,
  ): Promise<IOrganizationModel> {
    const userWithOrganization =
      await this.ongHubService.getUserAndOrganizationDataFromOngHub(token);

    if (!userWithOrganization || !userWithOrganization.organization) {
      this.exceptionService.internalServerErrorException(
        OngHubExceptionMessages.ONG_002,
      );
    }

    try {
      const organization = await this.organizationService.updateOrganization(
        organizationId,
        {
          name: userWithOrganization.organization.name,
          email: userWithOrganization.organization.email,
          phone: userWithOrganization.organization.phone,
          address: userWithOrganization.organization.address,
          activityArea: userWithOrganization.organization.activityArea,
          logo: userWithOrganization.organization.logo,
          description: userWithOrganization.organization.description,
          cui: userWithOrganization.organization.cui,
          legalReprezentativeFullName:
            userWithOrganization.organization.legalReprezentativeFullName,
          legalReprezentativeRole:
            userWithOrganization.organization.legalReprezentativeRole,
        },
      );

      return organization;
    } catch (error) {
      console.log('[ONGHub Sync] Error updating organization:', error);
      this.exceptionService.internalServerErrorException(
        OngHubExceptionMessages.ONG_004,
      );
    }
  }
}
