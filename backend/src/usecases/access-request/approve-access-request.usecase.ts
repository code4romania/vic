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
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { CreateVolunteerUseCase } from '../volunteer/create-volunteer.usecase';
import { PushNotificationsFacade } from 'src/modules/notifications/notifications.facade';

@Injectable()
export class ApproveAccessRequestUseCase
  implements IUseCaseService<IAccessRequestModel>
{
  constructor(
    private readonly accessRequestFacade: AccessRequestFacade,
    private readonly createVolunteerUseCase: CreateVolunteerUseCase,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly pushNotificationsFacade: PushNotificationsFacade,
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
    const volunteer = await this.createVolunteerUseCase.execute({
      organizationId: accessRequest.organizationId,
      userId: accessRequest.requestedBy?.id,
    });

    // TODO: 2. send email and notification
    this.pushNotificationsFacade.send({
      userIds: [accessRequest.requestedBy.id],
      title: 'Cererea de access a fost aprobata',
      body: JSON.stringify({
        organizationId: accessRequest.organizationId,
        organizationName: 'Test',
        type: 'APPROVE_ACCESS_REQUEST',
      }),
    });

    const updated = await this.accessRequestFacade.update({
      ...updates,
      status: AccessRequestStatus.APPROVED,
    });

    // Track event
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.APPROVE_ACCESS_REQUEST,
      {
        accessRequestId: accessRequest.id,
        userName: accessRequest.requestedBy?.name,
        userId: accessRequest.requestedBy?.id,
        volunteerId: volunteer.id,
      },
      admin,
    );

    return updated;
  }
}
