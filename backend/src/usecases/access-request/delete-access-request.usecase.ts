import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AccessRequestStatus } from 'src/modules/access-request/enums/access-request-status.enum';
import { AccessRequestExceptionMessages } from 'src/modules/access-request/exceptions/access-request.exceptions';
import { AccessRequestFacade } from 'src/modules/access-request/services/access-request.facade';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';

@Injectable()
export class DeleteAccessRequestUseCase implements IUseCaseService<string> {
  constructor(
    private readonly accessRequestFacade: AccessRequestFacade,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(id: string, admin: IAdminUserModel): Promise<string> {
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

    const deleted = await this.accessRequestFacade.delete(id);

    // Track action
    // this.actionsArchiveFacade.trackEvent({
    //   actionType: ActionsType.DELETE,
    //   resourceType: ActionsResourceType.ACCESS_REQUEST,
    //   resourceId: deleted,
    //   author: admin,
    //   changes: ObjectDiff.diff(accessRequest, undefined),
    // });

    return deleted;
  }
}
