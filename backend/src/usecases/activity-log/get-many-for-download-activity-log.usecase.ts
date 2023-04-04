import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { IActivityLogDownload } from 'src/modules/activity-log/interfaces/activity-log-download.interface';
import { FindManyActivityLogsDownloadOptions } from 'src/modules/activity-log/models/activity-log.model';
import { ActivityLogFacade } from 'src/modules/activity-log/services/activity-log.facade';

@Injectable()
export class GetManyForDownloadActivityLogUseCase
  implements IUseCaseService<IActivityLogDownload[]>
{
  constructor(private readonly activityLogFacade: ActivityLogFacade) {}

  public async execute(
    findManyOptions: FindManyActivityLogsDownloadOptions,
  ): Promise<IActivityLogDownload[]> {
    const activityLogs = await this.activityLogFacade.findManyForDownload({
      ...findManyOptions,
    });

    return activityLogs.items.map((activityLog): IActivityLogDownload => {
      return {
        'Nume task': activityLog.activityType?.name || 'Alta optiune',
        'Nume eveniment': activityLog.event?.name,
        'Numar ore': activityLog.hours,
        'Data participarii': activityLog.date,
        'Numele voluntarului': activityLog.volunteer.name,
        Mentiuni: activityLog.mentions,
        'Inregistrat de':
          activityLog.createdByAdmin.name || activityLog.volunteer.name,
        'Data inregistrarii': activityLog.createdOn,
        'Aprobat de': activityLog.approvedBy.name,
        'Data aprobarii': activityLog.approvedOn,
      };
    });
  }
}
