import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  FindManyAnnouncementResponsesOptions,
  IAnnouncementResponseModel,
} from 'src/modules/announcement/models/announcement-response.model';
import { AnnouncementFacade } from 'src/modules/announcement/services/announcement.facade';

// #504: the answers to one announcement (the controller's guard checks the organization)
@Injectable()
export class GetAnnouncementResponsesUseCase
  implements IUseCaseService<Pagination<IAnnouncementResponseModel>>
{
  constructor(private readonly announcementFacade: AnnouncementFacade) {}

  execute(
    options: FindManyAnnouncementResponsesOptions,
  ): Promise<Pagination<IAnnouncementResponseModel>> {
    return this.announcementFacade.findManyResponses(options);
  }
}
