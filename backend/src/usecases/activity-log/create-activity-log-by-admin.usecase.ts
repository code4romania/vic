import { Injectable } from '@nestjs/common';
import { CreateActivityLogByAdminDto } from 'src/api/activity-log/dto/create-activity-log-by-admin.dto';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActivityLogStatus } from 'src/modules/activity-log/enums/activity-log-status.enum';
import { ActivityLogExceptionMessages } from 'src/modules/activity-log/exceptions/activity-log.exceptions';
import { IActivityLogModel } from 'src/modules/activity-log/models/activity-log.model';
import { ActivityLogFacade } from 'src/modules/activity-log/services/activity-log.facade';
import { ActivityTypeExceptionMessages } from 'src/modules/activity-type/exceptions/activity-type.exceptions';
import { ActivityTypeFacade } from 'src/modules/activity-type/services/activity-type.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetOneEventUseCase } from '../event/get-one-event.usecase';

@Injectable()
export class CreateActivityLogByAdmin
  implements IUseCaseService<IActivityLogModel>
{
  constructor(
    private readonly getOneEventUsecase: GetOneEventUseCase,
    private readonly activityLogFacade: ActivityLogFacade,
    private readonly activityTypeFacade: ActivityTypeFacade,
    private readonly volunteerFacade: VolunteerFacade,

    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    newLogRequestDto: CreateActivityLogByAdminDto,
    admin: IAdminUserModel,
  ): Promise<IActivityLogModel> {
    // 1. Check if the volunteer exists in the organization and have a profile
    const volunteer = await this.volunteerFacade.find({
      id: newLogRequestDto.volunteerId,
      organizationId: admin.organizationId,
      status: VolunteerStatus.ACTIVE,
    });

    if (!volunteer) {
      this.exceptionService.notFoundException(
        VolunteerExceptionMessages.VOLUNTEER_001,
      );
    } else if (!volunteer.volunteerProfile) {
      this.exceptionService.badRequestException(
        ActivityLogExceptionMessages.ACTIVITY_LOG_002,
      );
    }
    // 2. Check if the event exists in the organization
    await this.getOneEventUsecase.execute({
      id: newLogRequestDto.eventId,
      organizationId: admin.organizationId,
    });
    // 3. Check if the task exists in the organization
    const taskExists = await this.activityTypeFacade.exists(
      [newLogRequestDto.activityTypeId],
      { organizationId: admin.organizationId },
    );
    if (!taskExists) {
      this.exceptionService.badRequestException(
        ActivityTypeExceptionMessages.ACTIVITY_TYPE_001,
      );
    }

    // ========================================================================
    // 4. Create the log. An Activity Log created by an Admin, is automatically approved
    return this.activityLogFacade.create({
      date: newLogRequestDto.date,
      hours: newLogRequestDto.hours,
      mentions: newLogRequestDto.mentions,
      volunteerId: newLogRequestDto.volunteerId,
      eventId: newLogRequestDto.eventId,
      activityTypeId: newLogRequestDto.activityTypeId,

      status: ActivityLogStatus.APPROVED,

      createdByAdminId: admin.id,
      approvedById: admin.id,
      approvedOn: new Date(),
      organizationId: admin.organizationId,
    });
  }
}
