import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';
import {
  FindManyAnnouncementForUserOptions,
  IAnnouncementModel,
} from 'src/modules/announcement/models/announcement.model';
export type IAnnouncementWithMyResponse = IAnnouncementModel & {
  myResponse: { comment: string; createdOn: Date } | null;
};

import { AnnouncementFacade } from 'src/modules/announcement/services/announcement.facade';

@Injectable()
export class GetManyAnouncementsByUserAsUsecase
  implements IUseCaseService<Pagination<IAnnouncementWithMyResponse>>
{
  constructor(private readonly announcementFacade: AnnouncementFacade) {}

  public async execute(
    findOptions: FindManyAnnouncementForUserOptions,
  ): Promise<Pagination<IAnnouncementWithMyResponse>> {
    const page = await this.announcementFacade.findManyByRegularUser({
      ...findOptions,
      status: AnnouncementStatus.ACTIVE,
      visibleOn: new Date(),
    });

    // #504: the volunteer's own answers
    const responses = await this.announcementFacade.findResponsesForUser(
      findOptions.userId,
      page.items.map((announcement) => announcement.id),
    );
    return {
      ...page,
      items: page.items.map((announcement) => ({
        ...announcement,
        myResponse: responses[announcement.id] ?? null,
      })),
    };
  }
}
