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
  ): Promise<IAccessRequestDownload[]> {
    const accessRequests = await this.accessRequestFacade.findMany({
      ...findOptions,
      limit: 0,
      page: 0,
    });

    return accessRequests.items.map((accessRequest): IAccessRequestDownload => {
      return {
        Nume: accessRequest.requestedBy.name,
        'Data nasterii': accessRequest.requestedBy.birthday,
        Sex: accessRequest.requestedBy.sex,
        Email: accessRequest.requestedBy.email,
        Telefon: accessRequest.requestedBy.phone,
        Locatie:
          accessRequest.requestedBy.location.name +
          ', jud. ' +
          accessRequest.requestedBy.location.county.name,
        'Data creare cerere': accessRequest.createdOn,
        ...(accessRequest.status === AccessRequestStatus.REJECTED
          ? {
              'Data refuz cerere': accessRequest.updatedOn,
              'Motivul refuzului': accessRequest.rejectionReason,
            }
          : {}),
      };
    });
  }
}
