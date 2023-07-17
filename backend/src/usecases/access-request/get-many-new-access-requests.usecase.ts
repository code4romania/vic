import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
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
  constructor(
    private readonly accessRequestFacade: AccessRequestFacade,
    private readonly s3Service: S3Service,
  ) {}

  public async execute(
    findOptions: FindManyAccessRequestsOptions,
  ): Promise<Pagination<IAccessRequestModel>> {
    const requests = await this.accessRequestFacade.findMany({
      ...findOptions,
      status: AccessRequestStatus.PENDING,
    });

    // TODO: review this
    const itemsWithPaths = await Promise.all(
      requests.items.map(async (request) => ({
        ...request,
        requestedBy: {
          ...request.requestedBy,
          profilePicture: request.requestedBy.profilePicture
            ? await this.s3Service.generatePresignedURL(
                request.requestedBy.profilePicture,
              )
            : '',
        },
      })),
    );

    return {
      ...requests,
      items: itemsWithPaths,
    };
  }
}
