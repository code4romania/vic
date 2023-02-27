import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import {
  FindVolunteerOptions,
  IVolunteerModel,
} from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

@Injectable()
export class GetOneVolunteerUsecase
  implements IUseCaseService<IVolunteerModel>
{
  constructor(
    private readonly volunteerFacade: VolunteerFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    options: FindVolunteerOptions,
  ): Promise<IVolunteerModel> {
    const volunteer = await this.volunteerFacade.find(options);

    if (!volunteer) {
      this.exceptionService.notFoundException(
        VolunteerExceptionMessages.VOLUNTEER_001,
      );
    }

    return volunteer;
  }
}
