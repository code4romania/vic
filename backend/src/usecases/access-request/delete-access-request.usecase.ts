import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AccessRequestStatus } from 'src/modules/access-request/enums/access-request-status.enum';
import { AccessRequestExceptionMessages } from 'src/modules/access-request/exceptions/access-request.exceptions';
import { AccessRequestFacade } from 'src/modules/access-request/services/access-request.facade';

@Injectable()
export class DeleteAccessRequestUseCase implements IUseCaseService<string> {
  constructor(
    private readonly accessRequestFacade: AccessRequestFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(id: string): Promise<string> {
    const accessRequest = await this.accessRequestFacade.find({ id });

    if (!accessRequest) {
      this.exceptionService.notFoundException(
        AccessRequestExceptionMessages.ACCESS_REQUEST_002,
      );
    }

    // Only REJECTED access requests can be deleted
    if (accessRequest.status !== AccessRequestStatus.REJECTED) {
      this.exceptionService.badRequestException(
        AccessRequestExceptionMessages.ACCESS_REQUEST_003,
      );
    }

    return this.accessRequestFacade.delete(id);
  }
}
