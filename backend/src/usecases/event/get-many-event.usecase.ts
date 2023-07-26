import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import {
  FindManyEventOptions,
  IEventsListItemModel,
} from 'src/modules/event/models/event.model';
import { EventFacade } from 'src/modules/event/services/event.facade';

@Injectable()
export class GetManyEventUseCase
  implements IUseCaseService<Pagination<IEventsListItemModel>>
{
  constructor(
    private readonly eventFacade: EventFacade,
    private readonly s3Service: S3Service,
  ) {}

  async execute(
    findOptions: FindManyEventOptions,
  ): Promise<Pagination<IEventsListItemModel>> {
    const events = await this.eventFacade.getMany(findOptions);

    const itemsWithPaths = await Promise.all(
      events.items.map(async (item) => ({
        ...item,
        poster: item.poster
          ? await this.s3Service.generatePresignedURL(item.poster)
          : null,
      })),
    );

    return {
      ...events,
      items: itemsWithPaths,
    };
  }
}
