import { isUUID } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActivityLogExceptionMessages } from 'src/modules/activity-log/exceptions/activity-log.exceptions';
import { IActivityLogModel } from 'src/modules/activity-log/models/activity-log.model';
import { ActivityLogFacade } from 'src/modules/activity-log/services/activity-log.facade';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { IContractModel } from 'src/modules/documents/models/contract.model';
import { ContractFacade } from 'src/modules/documents/services/contract.facade';
import { NotificationsExceptionMessages } from 'src/modules/notifications/exceptions/notifications.exceptions';
import { UserExceptionMessages } from 'src/modules/user/exceptions/exceptions';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

// Mobile: what a volunteer opens by id must be theirs. The person always comes from the token; a
// resource of someone else answers 404, like one that does not exist, so ids cannot be probed.
@Injectable()
export class MobileOwnershipService {
  constructor(
    private readonly volunteerFacade: VolunteerFacade,
    private readonly activityLogFacade: ActivityLogFacade,
    private readonly contractFacade: ContractFacade,
    private readonly exceptionsService: ExceptionsService,
  ) {}

  // A login without a profile has no user id: never look anything up with { userId: undefined }
  // (TypeORM drops the key and would match any row).
  public assertHasProfile(user: Partial<IRegularUserModel>): void {
    if (!user?.id) {
      this.exceptionsService.notFoundException(UserExceptionMessages.USER_001);
    }
  }

  // The user's volunteer in the active organization: 400 VOLUNTEER_005 without one. An id the
  // client sent (older apps do) must be that same volunteer, otherwise 404 VOLUNTEER_001.
  public activeVolunteerId(
    user: IRegularUserModel,
    requestedVolunteerId?: string,
  ): string {
    const volunteerId = user?.activeOrganization?.volunteerId;
    if (!volunteerId) {
      this.exceptionsService.badRequestException(
        VolunteerExceptionMessages.VOLUNTEER_005,
      );
    }
    if (requestedVolunteerId && requestedVolunteerId !== volunteerId) {
      this.exceptionsService.notFoundException(
        VolunteerExceptionMessages.VOLUNTEER_001,
      );
    }
    return volunteerId;
  }

  public async volunteer(
    userId: string,
    volunteerId: string,
  ): Promise<IVolunteerModel> {
    const volunteer =
      userId && isUUID(volunteerId)
        ? await this.volunteerFacade.find({ id: volunteerId, userId })
        : null;

    if (!volunteer) {
      this.exceptionsService.notFoundException(
        VolunteerExceptionMessages.VOLUNTEER_001,
      );
    }

    return volunteer;
  }

  // The user's volunteer in an organization, unless the organization blocked them.
  public async volunteerInOrganization(
    userId: string,
    organizationId: string,
  ): Promise<IVolunteerModel | null> {
    if (!userId || !organizationId) return null;

    const volunteer = await this.volunteerFacade.find({
      userId,
      organizationId,
    });

    return volunteer && volunteer.status !== VolunteerStatus.BLOCKED
      ? volunteer
      : null;
  }

  public async activityLog(
    userId: string,
    activityLogId: string,
  ): Promise<IActivityLogModel> {
    const log =
      userId && isUUID(activityLogId)
        ? await this.activityLogFacade.find(activityLogId)
        : null;

    if (!log || log.volunteer?.user?.id !== userId) {
      this.exceptionsService.notFoundException(
        ActivityLogExceptionMessages.ACTIVITY_LOG_001,
      );
    }

    return log;
  }

  public async contract(
    userId: string,
    contractId: string,
  ): Promise<IContractModel> {
    const contract =
      userId && isUUID(contractId)
        ? await this.contractFacade.findOne({ id: contractId })
        : null;

    if (!contract || contract.volunteer?.user?.id !== userId) {
      this.exceptionsService.notFoundException(
        ContractExceptionMessages.CONTRACT_002,
      );
    }

    return contract;
  }

  public notificationsSettings(
    user: IRegularUserModel,
    settingsId: string,
  ): void {
    if (!settingsId || user?.notificationsSettings?.id !== settingsId) {
      this.exceptionsService.notFoundException(
        NotificationsExceptionMessages.NOTIFICATIONS_002,
      );
    }
  }
}
