import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

@Injectable()
export class GetOneVolunteerUsecase
  implements IUseCaseService<IVolunteerModel>
{
  constructor(
    private readonly volunteerFacade: VolunteerFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly s3Service: S3Service,
  ) {}

  public async execute(id: string): Promise<IVolunteerModel> {
    const volunteer = await this.volunteerFacade.find({ id });

    if (!volunteer) {
      this.exceptionService.notFoundException(
        VolunteerExceptionMessages.VOLUNTEER_001,
      );
    }

    return {
      ...volunteer,
      user: {
        ...volunteer.user,
        profilePicture: volunteer.user.profilePicture
          ? await this.s3Service.generatePresignedURL(
              volunteer.user.profilePicture,
            )
          : volunteer.user.profilePicture,
      },
    };
  }
}
