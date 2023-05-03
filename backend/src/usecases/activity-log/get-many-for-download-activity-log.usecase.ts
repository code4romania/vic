import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ActivityLogStatus } from 'src/modules/activity-log/enums/activity-log-status.enum';
import { IActivityLogDownload } from 'src/modules/activity-log/interfaces/activity-log-download.interface';
import { FindManyActivityLogsOptions } from 'src/modules/activity-log/models/activity-log.model';
import { ActivityLogFacade } from 'src/modules/activity-log/services/activity-log.facade';

@Injectable()
export class GetManyForDownloadActivityLogUseCase
  implements IUseCaseService<IActivityLogDownload[]>
{
  constructor(private readonly activityLogFacade: ActivityLogFacade) {}

  public async execute(
    findManyOptions: FindManyActivityLogsOptions,
  ): Promise<IActivityLogDownload[]> {
    const activityLogs = await this.activityLogFacade.findMany({
      ...findManyOptions,
      limit: 0,
      page: 0,
    });

    return activityLogs.items.map((activityLog): IActivityLogDownload => {
      return {
        'Nume task': activityLog.activityType?.name || 'Alta optiune',
        'Nume eveniment': activityLog.event?.name,
        'Numar ore': activityLog.hours,
        'Data participarii': activityLog.date,
        'Numele voluntarului': activityLog.volunteer?.name,
        Mentiuni: activityLog.mentions,
        'Inregistrata de':
          activityLog.createdByAdmin?.name || activityLog.volunteer?.name,
        'Data inregistrarii': activityLog.createdOn,
        Status:
          activityLog.status === ActivityLogStatus.APPROVED
            ? 'Aprobat'
            : 'Respins',
        ...(activityLog.approvedBy
          ? {
              'Aprobata de': activityLog.approvedBy?.name,
              'Data aprobarii': activityLog.approvedOn,
            }
          : {}),
        ...(activityLog.rejectedBy
          ? {
              'Respinsa de': activityLog.rejectedBy?.name,
              'Data respingerii': activityLog.rejectedOn,
            }
          : {}),
      };
    });
  }
}
