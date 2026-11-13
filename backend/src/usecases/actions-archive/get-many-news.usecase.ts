import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { NEWS_EVENTS } from 'src/modules/actions-archive/enums/news-type.enum';
import {
  FindManyNewsOptions,
  IActionArchiveModel,
} from 'src/modules/actions-archive/models/actions-archive.model';

@Injectable()
export class GetManyNewsUsecase
  implements IUseCaseService<Pagination<IActionArchiveModel>>
{
  constructor(private readonly actionsArchiveFacade: ActionsArchiveFacade) {}

  public async execute(
    options: FindManyNewsOptions,
  ): Promise<Pagination<IActionArchiveModel>> {
    const { type, ...findOptions } = options;

    return this.actionsArchiveFacade.findNews({
      ...findOptions,
      events: NEWS_EVENTS[type] ?? [],
    });
  }
}
