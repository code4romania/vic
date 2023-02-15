import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AccessRequestStatus } from 'src/modules/access-request/enums/access-request-status.enum';
import { AccessRequestExceptionMessages } from 'src/modules/access-request/exceptions/access-request.exceptions';
import {
  CreateAccessRequestModel,
  IAccessRequestModel,
} from 'src/modules/access-request/model/access-request.model';
import { AccessRequestFacade } from 'src/modules/access-request/services/access-request.facade';

@Injectable()
export class CreateAccessRequestUseCase
  implements IUseCaseService<IAccessRequestModel>
{
  constructor(
    private readonly accessRequestFacade: AccessRequestFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    createRequestModel: CreateAccessRequestModel,
  ): Promise<IAccessRequestModel> {
    // 1. Search if there is another request for the: same "USER", "ORGANIZATION" and status "PENDING"
    // TODO: also need to check if the user is already part of organization (isVolunteer)
    const existingRequest = await this.accessRequestFacade.find({
      requestedById: createRequestModel.requestedById,
      organizationId: createRequestModel.organizationId,
      status: AccessRequestStatus.PENDING,
    });

    if (existingRequest) {
      this.exceptionService.badRequestException(
        AccessRequestExceptionMessages.ACCESS_REQUEST_001,
      );
    }

    return this.accessRequestFacade.create(createRequestModel);
  }
}
