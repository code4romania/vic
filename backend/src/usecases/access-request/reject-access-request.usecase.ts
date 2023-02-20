import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AccessRequestStatus } from 'src/modules/access-request/enums/access-request-status.enum';
import { AccessRequestExceptionMessages } from 'src/modules/access-request/exceptions/access-request.exceptions';
import {
  IAccessRequestModel,
  RejectAccessRequestModel,
} from 'src/modules/access-request/model/access-request.model';
import { AccessRequestFacade } from 'src/modules/access-request/services/access-request.facade';

@Injectable()
export class RejectAccessRequestUseCase
  implements IUseCaseService<IAccessRequestModel>
{
  constructor(
    private readonly accessRequestFacade: AccessRequestFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    updates: RejectAccessRequestModel,
  ): Promise<IAccessRequestModel> {
    const accessRequest = await this.accessRequestFacade.find({
      id: updates.id,
    });

    if (!accessRequest) {
      this.exceptionService.notFoundException(
        AccessRequestExceptionMessages.ACCESS_REQUEST_002,
      );
    }

    // Access Request must be in PENDING status to allow updates.
    if (accessRequest.status !== AccessRequestStatus.PENDING) {
      this.exceptionService.badRequestException(
        AccessRequestExceptionMessages.ACCESS_REQUEST_004,
      );
    }

    // TODO: 1. create volunteer user for the organization
    // TODO: 2. send email and notification

    return this.accessRequestFacade.update({
      ...updates,
      status: AccessRequestStatus.REJECTED,
    });
  }
}
