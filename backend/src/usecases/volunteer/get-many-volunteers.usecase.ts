import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import {
  FindManyVolunteersOptions,
  IVolunteerModel,
} from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

@Injectable()
export class GetManyVolunteersUseCase
  implements IUseCaseService<Pagination<IVolunteerModel>>
{
  constructor(
    private readonly volunteerFacade: VolunteerFacade,
    private readonly s3Service: S3Service,
  ) {}

  public async execute(
    findOptions: FindManyVolunteersOptions,
  ): Promise<Pagination<IVolunteerModel>> {
    const volunteers = await this.volunteerFacade.findMany(findOptions);

    // TODO: review this
    const itemsWithPaths = await Promise.all(
      volunteers.items.map(async (volunteer) => ({
        ...volunteer,
        user: {
          ...volunteer.user,
          profilePicture: volunteer.user.profilePicture
            ? await this.s3Service.generatePresignedURL(
                volunteer.user.profilePicture,
              )
            : '',
        },
      })),
    );

    return {
      ...volunteers,
      items: itemsWithPaths,
    };
  }
}
