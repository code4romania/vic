import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  FindManyAnnouncementOptions,
  IAnnouncementModel,
} from 'src/modules/announcement/models/announcement.model';
import { AnnouncementFacade } from 'src/modules/announcement/services/announcement.facade';

@Injectable()
export class GetManyAnnouncementUseCase
  implements IUseCaseService<Pagination<IAnnouncementModel>>
{
  constructor(private readonly announcementFacade: AnnouncementFacade) {}

  public async execute(
    findOptions: FindManyAnnouncementOptions,
  ): Promise<Pagination<IAnnouncementModel>> {
    return this.announcementFacade.findMany(findOptions);
  }
}
