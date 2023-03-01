import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { UpdateVolunteerProfileOptions } from 'src/modules/volunteer/model/volunteer-profile.model';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetOneVolunteerUsecase } from './get-one-volunteer.usecase';

@Injectable()
export class UpdateVolunteerProfileUsecase
  implements IUseCaseService<IVolunteerModel>
{
  constructor(
    private readonly volunteerFacade: VolunteerFacade,
    private readonly getOneVolunteerUsecase: GetOneVolunteerUsecase,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    volunteerId: string,
    updates: UpdateVolunteerProfileOptions,
  ): Promise<IVolunteerModel> {
    const volunteer = await this.getOneVolunteerUsecase.execute(volunteerId);

    if (!volunteer.volunteerProfile) {
      this.exceptionService.badRequestException(
        VolunteerExceptionMessages.VOLUNTEER_PROFILE_003,
      );
    }

    await this.volunteerFacade.updateProfile(
      volunteer.volunteerProfile.id,
      updates,
    );

    return this.getOneVolunteerUsecase.execute(volunteerId);
  }
}
