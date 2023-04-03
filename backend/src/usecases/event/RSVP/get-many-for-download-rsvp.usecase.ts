import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { IEventRSVPDownload } from 'src/modules/event/interfaces/event-rsvp-download.interface';
import { GetManyEventRSVPUseCase } from './get-many-rsvp.usecase';
import { FindManyEventRSVPOptions } from 'src/modules/event/models/event-rsvp.model';

@Injectable()
export class GetManyForDownloadEventRSVPUseCase
  implements IUseCaseService<IEventRSVPDownload[]>
{
  constructor(
    private readonly getManyEventRSVPUseCase: GetManyEventRSVPUseCase,
  ) {}

  public async execute(
    findOptions: FindManyEventRSVPOptions,
  ): Promise<IEventRSVPDownload[]> {
    const eventRSVPs = await this.getManyEventRSVPUseCase.execute({
      ...findOptions,
      limit: 0,
      page: 0,
    });

    return eventRSVPs.items.map((rsvp): IEventRSVPDownload => {
      return {
        Nume: rsvp.user.name,
        Raspuns: rsvp.going ? 'Participa' : 'Nu participa',
        'Voluntar in organizatie': rsvp.volunteerId ? 'Da' : 'Nu',
        Mentiune: rsvp.mention,
      };
    });
  }
}
