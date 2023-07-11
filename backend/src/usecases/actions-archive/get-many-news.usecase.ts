import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
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
    return this.actionsArchiveFacade.findNews({
      ...options,
      events: [TrackedEventName.CHANGE_ACTIVITY_LOG_STATUS],
    });
  }
}
