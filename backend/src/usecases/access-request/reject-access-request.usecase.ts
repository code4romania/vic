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
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { DataSource } from 'typeorm';
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
    private readonly volunteerFacade: VolunteerFacade,
    private readonly dataSource: DataSource,
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

    // A pending request, or an approved one whose decision changes (#500)
    if (accessRequest.status === AccessRequestStatus.REJECTED) {
      this.exceptionService.badRequestException(
        AccessRequestExceptionMessages.ACCESS_REQUEST_004,
      );
    }
    if (accessRequest.status === AccessRequestStatus.APPROVED) {
      await this.removeApprovedVolunteer(
        accessRequest.requestedBy.id,
        accessRequest.organizationId,
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
        updates.rejectionReason,
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
    );

    return updated;
  }

  // Changing an approval to a rejection takes back the volunteer record the approval created, as long
  // as nothing hangs on it yet; otherwise the NGO makes the volunteer inactive (ACCESS_REQUEST_005).
  private async removeApprovedVolunteer(
    userId: string,
    organizationId: string,
  ): Promise<void> {
    const volunteer = await this.volunteerFacade.find({
      userId,
      organizationId,
    });
    if (!volunteer) return;

    const [{ count }] = await this.dataSource.query(
      `SELECT
         (SELECT count(*) FROM activity_log WHERE volunteer_id = $1)
       + (SELECT count(*) FROM contract WHERE volunteer_id = $1)
       + (SELECT count(*) FROM event_rsvp r JOIN event e ON e.id = r.event_id
            WHERE r.user_id = $2 AND e.organization_id = $3)::int AS count`,
      [volunteer.id, userId, organizationId],
    );
    if (Number(count) > 0) {
      this.exceptionService.badRequestException(
        AccessRequestExceptionMessages.ACCESS_REQUEST_005,
      );
    }

    // Anything else that points at the record (a foreign key) also means it is in use.
    await this.dataSource
      .transaction(async (manager) => {
        await manager.query(`DELETE FROM volunteer WHERE id = $1`, [
          volunteer.id,
        ]);
        if (volunteer.volunteerProfile?.id) {
          await manager.query(`DELETE FROM volunteer_profile WHERE id = $1`, [
            volunteer.volunteerProfile.id,
          ]);
        }
        await manager.query(
          `UPDATE "user" SET active_organization_id = NULL WHERE id = $1 AND active_organization_id = $2`,
          [userId, organizationId],
        );
      })
      .catch((error) => {
        if (error?.code === '23503') {
          this.exceptionService.badRequestException(
            AccessRequestExceptionMessages.ACCESS_REQUEST_005,
          );
        }
        throw error;
      });
  }
}
