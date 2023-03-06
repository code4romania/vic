import { Injectable } from '@nestjs/common';
import { IAccessRequestDownload } from 'src/common/interfaces/access-request-download.interface';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { AccessRequestStatus } from 'src/modules/access-request/enums/access-request-status.enum';
import { FindManyAccessRequestsOptions } from 'src/modules/access-request/model/access-request.model';
import { AccessRequestFacade } from 'src/modules/access-request/services/access-request.facade';

@Injectable()
export class GetAccessRequestsForDownloadUseCase
  implements IUseCaseService<IAccessRequestDownload[]>
{
  constructor(private readonly accessRequestFacade: AccessRequestFacade) {}

  public async execute(
    findOptions: FindManyAccessRequestsOptions,
    status: AccessRequestStatus,
  ): Promise<IAccessRequestDownload[]> {
    return this.accessRequestFacade.getManyForDownload({
      ...findOptions,
      status,
    });
  }
}
