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
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import ApproveRequestEvent from 'src/modules/notifications/events/join-ngo/approve-request.event';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { OrganizationGateService } from '../organization/organization-gate.service';

@Injectable()
export class ApproveAccessRequestUseCase
  implements IUseCaseService<IAccessRequestModel>
{
  constructor(
    private readonly accessRequestFacade: AccessRequestFacade,
    private readonly createVolunteerUseCase: CreateVolunteerUseCase,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly volunteerFacade: VolunteerFacade,
    private readonly userFacade: UserFacadeService,
    private readonly organizationGate: OrganizationGateService,
  ) {}

  public async execute(
    updates: ApproveAccessRequestModel,
    admin: IAdminUserModel,
  ): Promise<IAccessRequestModel> {
    // Decision 1: an NGO a super admin has not validated takes no volunteers in (403 ORG_005)
    await this.organizationGate.assertValidated(admin.organizationId);

    const accessRequest = await this.accessRequestFacade.find({
      id: updates.id,
    });

    if (!accessRequest) {
      this.exceptionService.notFoundException(
        AccessRequestExceptionMessages.ACCESS_REQUEST_002,
      );
    }

    // A pending request, or a rejected one whose decision changes (#500)
    if (accessRequest.status === AccessRequestStatus.APPROVED) {
      this.exceptionService.badRequestException(
        AccessRequestExceptionMessages.ACCESS_REQUEST_004,
      );
    }

    // A volunteer who left the organization rejoins with the same record (#500); anyone else
    // becomes a new volunteer of the organization.
    const existing = await this.volunteerFacade.find({
      userId: accessRequest.requestedBy?.id,
      organizationId: accessRequest.organizationId,
    });
    let volunteer: IVolunteerModel;
    if (
      existing?.status === VolunteerStatus.INACTIVE &&
      existing.archivedById === accessRequest.requestedBy?.id
    ) {
      volunteer = await this.volunteerFacade.activate(existing.id);
      await this.userFacade.updateRegularUser(accessRequest.requestedBy.id, {
        activeOrganizationId: accessRequest.organizationId,
      });
    } else {
      volunteer = await this.createVolunteerUseCase.execute({
        organizationId: accessRequest.organizationId,
        userId: accessRequest.requestedBy?.id,
      });
    }

    const updated = await this.accessRequestFacade.update({
      ...updates,
      status: AccessRequestStatus.APPROVED,
    });

    // send notifications
    this.eventEmitter.emit(
      EVENTS.JOIN_NGO.APPROVE_REQUEST,
      new ApproveRequestEvent(
        accessRequest.organizationId,
        accessRequest.requestedBy.id,
        volunteer.organization.name,
        accessRequest.requestedBy.notificationsSettings.notificationsViaPush,
        accessRequest.requestedBy.notificationsSettings.notificationsViaEmail,
        accessRequest.requestedBy.email,
        volunteer.id,
        volunteer.organization.logo,
      ),
    );

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
