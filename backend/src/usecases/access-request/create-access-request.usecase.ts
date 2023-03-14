import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AccessRequestStatus } from 'src/modules/access-request/enums/access-request-status.enum';
import { AccessRequestExceptionMessages } from 'src/modules/access-request/exceptions/access-request.exceptions';
import {
  CreateAccessRequestModel,
  IAccessRequestModel,
} from 'src/modules/access-request/model/access-request.model';
import { AccessRequestFacade } from 'src/modules/access-request/services/access-request.facade';
import { OrganizationExceptionMessages } from 'src/modules/organization/exceptions/exceptions';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { UserExceptionMessages } from 'src/modules/user/exceptions/exceptions';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

@Injectable()
export class CreateAccessRequestUseCase
  implements IUseCaseService<IAccessRequestModel>
{
  constructor(
    private readonly accessRequestFacade: AccessRequestFacade,
    private readonly organizationFacade: OrganizationFacadeService,
    private readonly userFacade: UserFacadeService,
    private readonly volunteerFacade: VolunteerFacade,

    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    createRequestModel: CreateAccessRequestModel,
  ): Promise<IAccessRequestModel> {
    // TODO 0. TEMPORARY: Check if the user exists until we have token
    const user = await this.userFacade.findRegularUser({
      id: createRequestModel.requestedById,
    });

    if (!user) {
      this.exceptionService.badRequestException(UserExceptionMessages.USER_001);
    }

    // ========================================================================
    // TODO: check if the user has the identity data completed, otherwise throw
    // ========================================================================

    // ========================================================================
    // 1. Check if the organization exists
    const organization = await this.organizationFacade.findOrganization({
      id: createRequestModel.organizationId,
    });

    if (!organization) {
      this.exceptionService.badRequestException(
        OrganizationExceptionMessages.ORG_001,
      );
    }
    // ========================================================================
    // 2. Check if the user is already part of organization (isVolunteer)
    const existingVolunteer = await this.volunteerFacade.find({
      userId: user.id,
      organizationId: organization.id,
    });

    if (existingVolunteer) {
      throw this.exceptionService.badRequestException(
        VolunteerExceptionMessages.VOLUNTEER_002,
      );
    }
    // ========================================================================
    // 3. Search if there is another request for the: same "USER", "ORGANIZATION" and status "PENDING"
    const existingRequest = await this.accessRequestFacade.find({
      requestedById: createRequestModel.requestedById,
      organizationId: createRequestModel.organizationId,
      status: AccessRequestStatus.PENDING,
    });

    if (existingRequest) {
      this.exceptionService.badRequestException(
        AccessRequestExceptionMessages.ACCESS_REQUEST_001,
      );
    }

    // ========================================================================
    // 4. Create the request
    return this.accessRequestFacade.create(createRequestModel);
  }
}
