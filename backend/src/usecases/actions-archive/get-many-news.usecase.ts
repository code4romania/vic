import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { NewsType } from 'src/modules/actions-archive/enums/news-type.enum';
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

    let events = [];

    switch (type) {
      case NewsType.ORGANIZATIONS:
        events = [
          TrackedEventName.APPROVE_ACCESS_REQUEST,
          TrackedEventName.REJECT_ACCESS_REQUEST,
        ];
        break;
      case NewsType.CONTRACTS:
        events = [
          TrackedEventName.CREATE_DOCUMENT_CONTRACT,
          TrackedEventName.VALIDATE_DOCUMENT_CONTRACT,
          TrackedEventName.SIGN_DOCUMENT_CONTRACT_BY_NGO,
          TrackedEventName.SIGN_DOCUMENT_CONTRACT_BY_VOLUNTEER,
          TrackedEventName.REJECT_DOCUMENT_CONTRACT_BY_NGO,
          TrackedEventName.REJECT_DOCUMENT_CONTRACT_BY_VOLUNTEER,
          TrackedEventName.DELETE_DOCUMENT_CONTRACT,
        ];
        break;
      case NewsType.LOGGED_HOURS:
        events = [TrackedEventName.CHANGE_ACTIVITY_LOG_STATUS];
        break;
    }

    return this.actionsArchiveFacade.findNews({
      ...findOptions,
      events,
    });
  }
}
