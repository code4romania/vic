import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AccessRequestStatus } from 'src/modules/access-request/enums/access-request-status.enum';
import { AccessRequestExceptionMessages } from 'src/modules/access-request/exceptions/access-request.exceptions';
import {
  IAccessRequestModel,
  RejectAccessRequestModel,
} from 'src/modules/access-request/model/access-request.model';
import { AccessRequestFacade } from 'src/modules/access-request/services/access-request.facade';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import RejectRequestEvent from 'src/modules/notifications/events/join-ngo/reject-request.event';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetOrganizationUseCaseService } from '../organization/get-organization.usecase';
@Injectable()
export class RejectAccessRequestUseCase
  implements IUseCaseService<IAccessRequestModel>
{
  constructor(
    private readonly accessRequestFacade: AccessRequestFacade,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly getOrganizationUsecase: GetOrganizationUseCaseService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async execute(
    updates: RejectAccessRequestModel,
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

    const organization = await this.getOrganizationUsecase.execute(
      accessRequest.organizationId,
    );

    // send notifications
    this.eventEmitter.emit(
      EVENTS.JOIN_NGO.REJECT_REQUEST,
      new RejectRequestEvent(
        accessRequest.organizationId,
        accessRequest.requestedBy.id,
        organization.name,
        accessRequest.requestedBy.notificationsSettings.notificationsViaPush,
        accessRequest.requestedBy.notificationsSettings.notificationsViaEmail,
        accessRequest.requestedBy.email,
      ),
    );

    const updated = await this.accessRequestFacade.update({
      ...updates,
      status: AccessRequestStatus.REJECTED,
    });

    // Track event
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.REJECT_ACCESS_REQUEST,
      {
        accessRequestId: accessRequest.id,
        userName: accessRequest.requestedBy?.name,
        userId: accessRequest.requestedBy?.id,
      },
      admin,
      admin.organizationId,
    );

    return updated;
  }
}
