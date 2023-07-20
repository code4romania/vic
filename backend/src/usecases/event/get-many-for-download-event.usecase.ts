import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { IEventDownload } from 'src/modules/event/interfaces/event-download.interface';
import { FindManyEventOptions } from 'src/modules/event/models/event.model';
import { EventFacade } from 'src/modules/event/services/event.facade';

@Injectable()
export class GetManyForDownloadEventUseCase
  implements IUseCaseService<IEventDownload[]>
{
  constructor(private readonly eventFacade: EventFacade) {}

  async execute(findOptions: FindManyEventOptions): Promise<IEventDownload[]> {
    const events = await this.eventFacade.getMany({
      ...findOptions,
      limit: 0,
      page: 0,
    });

    return events.items.map((event): IEventDownload => {
      return {
        Nume: event.name,
        'Data inceput': event.startDate,
        'Data sfarsit': event.endDate,
        Targets: event.isPublic
          ? 'Eveniment public'
          : event.targets?.length === 0
          ? 'Toata organizatia'
          : `${event.targets?.length} Departamente`,
        'Numar participari': event.going,
        'Numar refuzuri': event.notGoing,
        Status: event.status,
        'Ore raportate': event.activityLogged.totalHours,
      };
    });
  }
}
