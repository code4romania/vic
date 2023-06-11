import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

@Injectable()
export class GetVolunteerProfileUsecase
  implements IUseCaseService<IVolunteerModel>
{
  constructor(
    private readonly volunteerFacade: VolunteerFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(volunteerId: string): Promise<IVolunteerModel> {
    const volunteer = await this.volunteerFacade.find({
      id: volunteerId,
    });

    if (!volunteer) {
      this.exceptionService.notFoundException(
        VolunteerExceptionMessages.VOLUNTEER_001,
      );
    }

    if (!volunteer.volunteerProfile) {
      this.exceptionService.badRequestException(
        VolunteerExceptionMessages.VOLUNTEER_PROFILE_003,
      );
    }

    return volunteer;
  }
}
