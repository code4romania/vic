import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { AccessRequestExceptionMessages } from 'src/modules/access-request/exceptions/access-request.exceptions';
import { IAccessRequestModel } from 'src/modules/access-request/model/access-request.model';
import { AccessRequestFacade } from 'src/modules/access-request/services/access-request.facade';

@Injectable()
export class GetAccessRequestUseCase
  implements IUseCaseService<IAccessRequestModel>
{
  constructor(
    private readonly accessRequestFacade: AccessRequestFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly s3Service: S3Service,
  ) {}

  public async execute(id: string): Promise<IAccessRequestModel> {
    const accessRequest = await this.accessRequestFacade.find({ id });

    if (!accessRequest) {
      this.exceptionService.notFoundException(
        AccessRequestExceptionMessages.ACCESS_REQUEST_002,
      );
    }

    return {
      ...accessRequest,
      requestedBy: {
        ...accessRequest.requestedBy,
        profilePicture: accessRequest.requestedBy.profilePicture
          ? await this.s3Service.generatePresignedURL(
              accessRequest.requestedBy.profilePicture,
            )
          : accessRequest.requestedBy.profilePicture,
      },
    };
  }
}
