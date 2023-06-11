import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AccessRequestStatus } from 'src/modules/access-request/enums/access-request-status.enum';
import { AccessRequestExceptionMessages } from 'src/modules/access-request/exceptions/access-request.exceptions';
import { AccessRequestFacade } from 'src/modules/access-request/services/access-request.facade';

@Injectable()
export class CancelAccessRequestUsecase implements IUseCaseService<string> {
  constructor(
    private readonly accessRequestFacade: AccessRequestFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    organizationId: string,
    userId: string,
  ): Promise<string> {
    // 1. get pending access request
    const accessRequest = await this.accessRequestFacade.find({
      organizationId,
      requestedById: userId,
      status: AccessRequestStatus.PENDING,
    });

    // throw 404 if no such access request exists
    if (!accessRequest) {
      this.exceptionService.notFoundException(
        AccessRequestExceptionMessages.ACCESS_REQUEST_002,
      );
    }

    // 2. remove access request
    const deleted = await this.accessRequestFacade.delete(accessRequest.id);

    return deleted;
  }
}
