import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { IVolunteerDownload } from 'src/common/interfaces/volunteer-download.interface';
import { FindManyVolunteersOptions } from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

@Injectable()
export class GetVolunteersForDownloadUseCase
  implements IUseCaseService<IVolunteerDownload[]>
{
  constructor(private readonly volunteerFacade: VolunteerFacade) {}

  public async execute(
    findOptions: FindManyVolunteersOptions,
  ): Promise<IVolunteerDownload[]> {
    return this.volunteerFacade.getManyForDownload(findOptions);
  }
}
