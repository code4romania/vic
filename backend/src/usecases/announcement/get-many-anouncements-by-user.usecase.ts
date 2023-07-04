import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';
import {
  FindManyAnnouncementForUserOptions,
  IAnnouncementModel,
} from 'src/modules/announcement/models/announcement.model';
import { AnnouncementFacade } from 'src/modules/announcement/services/announcement.facade';

@Injectable()
export class GetManyAnouncementsByUserAsUsecase
  implements IUseCaseService<Pagination<IAnnouncementModel>>
{
  constructor(private readonly announcementFacade: AnnouncementFacade) {}

  public async execute(
    findOptions: FindManyAnnouncementForUserOptions,
  ): Promise<Pagination<IAnnouncementModel>> {
    return this.announcementFacade.findManyByRegularUser({
      ...findOptions,
      status: AnnouncementStatus.PUBLISHED,
    });
  }
}
