import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AccessRequestStatus } from 'src/modules/access-request/enums/access-request-status.enum';
import { AccessRequestExceptionMessages } from 'src/modules/access-request/exceptions/access-request.exceptions';
import {
  ApproveAccessRequestModel,
  IAccessRequestModel,
} from 'src/modules/access-request/model/access-request.model';
import { AccessRequestFacade } from 'src/modules/access-request/services/access-request.facade';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { CreateVolunteerUseCase } from '../volunteer/create-volunteer.usecase';

@Injectable()
export class ApproveAccessRequestUseCase
  implements IUseCaseService<IAccessRequestModel>
{
  constructor(
    private readonly accessRequestFacade: AccessRequestFacade,
    private readonly createVolunteerUseCase: CreateVolunteerUseCase,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    updates: ApproveAccessRequestModel,
    admin: IAdminUserModel,
  ): Promise<IAccessRequestModel> {
    const accessRequest = await this.accessRequestFacade.find({
      id: updates.id,
    });

    if (!accessRequest) {
      this.exceptionService.notFoundException(
        AccessRequestExceptionMessages.ACCESS_REQUEST_002,
      );
    }

    // Access Request must be in PENDING status to allow updates.
    if (accessRequest.status !== AccessRequestStatus.PENDING) {
      this.exceptionService.badRequestException(
        AccessRequestExceptionMessages.ACCESS_REQUEST_004,
      );
    }

    // Create volunteer user for the organization
    await this.createVolunteerUseCase.execute({
      organizationId: accessRequest.organizationId,
      userId: accessRequest.requestedBy?.id,
    });

    // TODO: 2. send email and notification

    const updated = await this.accessRequestFacade.update({
      ...updates,
      status: AccessRequestStatus.APPROVED,
    });

    // Track action
    // this.actionsArchiveFacade.trackEvent();

    return updated;
  }
}
