import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { AccessCodeExceptionMessages } from 'src/modules/organization/exceptions/access-codes.exceptions';
import { AccessCodeFacade } from 'src/modules/organization/services/access-code.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';

@Injectable()
export class DeleteAccessCodeUseCase implements IUseCaseService<string> {
  constructor(
    private readonly accessCodeFacade: AccessCodeFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute(id: string, admin: IAdminUserModel): Promise<string> {
    const accessCode = await this.accessCodeFacade.find({ id });

    if (!accessCode) {
      this.exceptionService.notFoundException(
        AccessCodeExceptionMessages.ACCESS_CODE_001,
      );
    }

    const deleted = await this.accessCodeFacade.delete(id);

    // #593
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.DELETE_ACCESS_CODE,
      { accessCodeId: accessCode.id, accessCode: accessCode.code },
      admin,
    );

    return deleted;
  }
}
