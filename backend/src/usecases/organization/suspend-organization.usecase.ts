import { Injectable, NotFoundException } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { SessionService } from 'src/modules/auth/services/session.service';
import { OrganizationStatus } from 'src/modules/organization/enums/organization-status.enum';
import { OrganizationExceptionMessages } from 'src/modules/organization/exceptions/exceptions';
import { IOrganizationModel } from 'src/modules/organization/models/organization.model';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { DataSource } from 'typeorm';

// Suspension is a status of the organization only (decisions R8): admins' identity statuses are untouched,
// so unsuspending restores exactly who could log in before, and an admin disabled on the Team page stays
// disabled. While suspended, login and every web request answer AUTH_004, and the NGO is hidden from
// volunteers. Suspend also ends the admins' sessions so they cannot keep refreshing.
@Injectable()
export class SuspendOrganizationUseCase
  implements IUseCaseService<IOrganizationModel>
{
  constructor(
    private readonly organizationFacade: OrganizationFacadeService,
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly sessionService: SessionService,
    private readonly dataSource: DataSource,
  ) {}

  async execute(organizationId: string): Promise<IOrganizationModel> {
    const organization = await findOrganizationOr404(
      this.organizationFacade,
      organizationId,
    );

    return this.dataSource.transaction(async (manager) => {
      const suspended = await this.organizationFacade.updateOrganization(
        organization.id,
        { status: OrganizationStatus.SUSPENDED, suspendedAt: new Date() },
        manager,
      );
      const admins = await this.authIdentityFacade.findByOrganizationId(
        organization.id,
      );
      for (const admin of admins) {
        await this.sessionService.revokeAll(admin.id, undefined, manager);
      }
      return suspended;
    });
  }
}

@Injectable()
export class UnsuspendOrganizationUseCase
  implements IUseCaseService<IOrganizationModel>
{
  constructor(private readonly organizationFacade: OrganizationFacadeService) {}

  async execute(organizationId: string): Promise<IOrganizationModel> {
    const organization = await findOrganizationOr404(
      this.organizationFacade,
      organizationId,
    );
    if (organization.status !== OrganizationStatus.SUSPENDED)
      return organization;

    return this.organizationFacade.updateOrganization(organization.id, {
      status: OrganizationStatus.ACTIVE,
      suspendedAt: null,
    });
  }
}

async function findOrganizationOr404(
  organizationFacade: OrganizationFacadeService,
  organizationId: string,
): Promise<IOrganizationModel> {
  const organization = organizationId
    ? await organizationFacade.findOrganization({ id: organizationId })
    : null;
  if (!organization) {
    throw new NotFoundException(OrganizationExceptionMessages.ORG_001);
  }
  return organization;
}
