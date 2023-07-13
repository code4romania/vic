import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { IVolunteerStats } from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

@Injectable()
export class GetVolunteerOrganizationStatusUsecase
  implements IUseCaseService<IVolunteerStats>
{
  constructor(
    private readonly volunteerFacade: VolunteerFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(id: string): Promise<IVolunteerStats> {
    const volunteer = await this.volunteerFacade.findVolunteerWithOngStats(id);

    if (!volunteer) {
      this.exceptionService.notFoundException(
        VolunteerExceptionMessages.VOLUNTEER_001,
      );
    }

    return volunteer;
  }
}
