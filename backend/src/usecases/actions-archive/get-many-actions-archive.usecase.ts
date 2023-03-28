import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import {
  FindManyActionsArchiveOptions,
  IActionArchiveModel,
} from 'src/modules/actions-archive/models/actions-archive.model';

@Injectable()
export class GetManyActionsArchiveUseCase
  implements IUseCaseService<Pagination<IActionArchiveModel>>
{
  constructor(private readonly actionsArchiveFacade: ActionsArchiveFacade) {}

  public async execute(
    options: FindManyActionsArchiveOptions,
  ): Promise<Pagination<IActionArchiveModel>> {
    return this.actionsArchiveFacade.findMany(options);
  }
}
