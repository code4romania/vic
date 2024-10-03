import { Injectable, Logger } from '@nestjs/common';
import { ObjectDiff } from 'src/common/helpers/object-diff';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { ActivityTypeFacade } from 'src/modules/activity-type/services/activity-type.facade';
import { EventAttendOptions } from 'src/modules/event/enums/event-attendance-options.enum';
import { EventStatus } from 'src/modules/event/enums/event-status.enum';
import { EventExceptionMessages } from 'src/modules/event/exceptions/event.exceptions';
import {
  IEventModel,
  UpdateEventOptions,
} from 'src/modules/event/models/event.model';
import { EventFacade } from 'src/modules/event/services/event.facade';
import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';
import { OrganizationStructureFacade } from 'src/modules/organization/services/organization-structure.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetOneEventUseCase } from './get-one-event.usecase';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { S3_FILE_PATHS } from 'src/common/constants/constants';
import { JSONStringifyError } from 'src/common/helpers/utils';

@Injectable()
export class UpdateEventUseCase implements IUseCaseService<IEventModel> {
  private readonly logger = new Logger(UpdateEventUseCase.name);

  constructor(
    private readonly eventFacade: EventFacade,
    private readonly getOneEventUseCase: GetOneEventUseCase,
    private readonly organizationStructureFacade: OrganizationStructureFacade,
    private readonly activityTypeFacade: ActivityTypeFacade,
    private readonly exceptionsService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly s3Service: S3Service,
  ) {}

  public async execute(
    id: string,
    data: UpdateEventOptions,
    admin: IAdminUserModel,
    files?: Express.Multer.File[],
  ): Promise<IEventModel> {
    // 1. Find the event to update
    const event = await this.getOneEventUseCase.execute({ id });

    // 2. Don't allow visibility changes if the status is PUBLISHED
    if (
      event.status !== EventStatus.DRAFT &&
      (data.isPublic !== undefined || data.targetsIds)
    ) {
      this.exceptionsService.badRequestException(
        EventExceptionMessages.EVENT_004,
      );
    }
    // 3. Check if the tasks exists in the organization
    if (data.tasksIds?.length) {
      const tasksExists = await this.activityTypeFacade.exists(data.tasksIds, {
        organizationId: event.organization.id,
      });
      if (!tasksExists) {
        this.exceptionsService.badRequestException(
          EventExceptionMessages.EVENT_003,
        );
      }
    }

    // 4.1. For public events, target must be null
    if (data.isPublic) {
      data.targetsIds = undefined;
    } else if (data.targetsIds?.length) {
      // 4.2 Check if the target is correct
      const targetExists = await this.organizationStructureFacade.exists(
        data.targetsIds,
        {
          organizationId: event.organization.id,
          type: OrganizationStructureType.DEPARTMENT,
        },
      );
      if (!targetExists) {
        this.exceptionsService.badRequestException(
          EventExceptionMessages.EVENT_002,
        );
      }
    }

    // 5. For SIMPLE attandanceType there should be no attendanceMention
    if (data.attendanceType === EventAttendOptions.SIMPLE) {
      data.attendanceMention = undefined;
    }

    // 5. save poster to s3
    try {
      let payload = data;
      if (files?.length > 0) {
        // 5.1. upload file to s3 and get the path
        const poster = await this.s3Service.uploadFile(
          `${S3_FILE_PATHS.EVENTS}/${admin.organizationId}`,
          files[0],
        );

        // 5.2 check if there is already a path at that file and remove it
        if (event.poster) {
          await this.s3Service.deleteFile(event.poster);
        }

        payload = { ...payload, poster };
      }

      const updated = await this.eventFacade.update(id, payload);

      this.actionsArchiveFacade.trackEvent(
        TrackedEventName.UPDATE_EVENT,
        {
          eventId: updated.id,
          eventName: updated.name,
        },
        admin,
        admin.organizationId,
        ObjectDiff.diff(event, updated),
      );

      return updated;
    } catch (error) {
      // log error
      this.logger.error({
        ...EventExceptionMessages.EVENT_008,
        error: JSONStringifyError(error),
      });
      // error while uploading file to s3
      this.exceptionsService.badRequestException(
        EventExceptionMessages.EVENT_008,
      );
    }
  }
}
