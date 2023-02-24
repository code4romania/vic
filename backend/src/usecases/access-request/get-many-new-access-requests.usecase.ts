import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { AccessRequestStatus } from 'src/modules/access-request/enums/access-request-status.enum';
import {
  FindManyAccessRequestsOptions,
  IAccessRequestModel,
} from 'src/modules/access-request/model/access-request.model';
import { AccessRequestFacade } from 'src/modules/access-request/services/access-request.facade';

@Injectable()
export class GetManyNewAccessRequestsUseCase
  implements IUseCaseService<Pagination<IAccessRequestModel>>
{
  constructor(private readonly accessRequestFacade: AccessRequestFacade) {}

  public async execute(
    findOptions: FindManyAccessRequestsOptions,
  ): Promise<Pagination<IAccessRequestModel>> {
    return this.accessRequestFacade.findMany({
      ...findOptions,
      status: AccessRequestStatus.PENDING,
    });
  }
}
