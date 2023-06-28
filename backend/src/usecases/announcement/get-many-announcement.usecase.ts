import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  FindManyAnnouncementOptions,
  IAnnouncementModel,
} from 'src/modules/announcement/models/announcement.model';
import { AnnouncementFacade } from 'src/modules/announcement/services/announcement.facade';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

@Injectable()
export class GetManyAnnouncementUseCase
  implements IUseCaseService<Pagination<IAnnouncementModel>>
{
  constructor(
    private readonly announcementFacade: AnnouncementFacade,
    private readonly volunteerFacade: VolunteerFacade,
  ) {}

  public async execute(
    findOptions: FindManyAnnouncementOptions,
  ): Promise<Pagination<IAnnouncementModel>> {
    const { userId, ...options } = findOptions;

    // case where we require anouncements from all organizations
    if (userId) {
      const volunteers = await this.volunteerFacade.findAll({ userId });
      const organizationIds = volunteers.map((v) => v.organization.id);
      options.organizationIds = organizationIds;
    }

    return this.announcementFacade.findMany(options);
  }
}
