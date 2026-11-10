import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { AccessCodeExceptionMessages } from 'src/modules/organization/exceptions/access-codes.exceptions';
import { IAccessCodeModel } from 'src/modules/organization/models/access-code.model';
import { AccessCodeFacade } from 'src/modules/organization/services/access-code.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { assertAccessCodePeriod } from './access-code-period';
import { OrganizationGateService } from '../organization/organization-gate.service';

@Injectable()
export class UpdateAccessCodeUseCase
  implements IUseCaseService<IAccessCodeModel>
{
  constructor(
    private readonly accessCodeFacade: AccessCodeFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly organizationGate: OrganizationGateService,
  ) {}

  // The NGO only changes the end date of a code.
  public async execute(
    { id, endDate }: Pick<IAccessCodeModel, 'id' | 'endDate'>,
    admin: IAdminUserModel,
  ): Promise<IAccessCodeModel> {
    const accessCode = await this.accessCodeFacade.find({ id });

    if (!accessCode) {
      this.exceptionService.notFoundException(
        AccessCodeExceptionMessages.ACCESS_CODE_001,
      );
    }

    // Extending a code only for a validated NGO (403 ORG_005)
    await this.organizationGate.assertValidated(accessCode.organizationId);

    // #593: the end date cannot be before the start date
    assertAccessCodePeriod(
      accessCode.startDate,
      endDate,
      this.exceptionService,
    );

    const updated = await this.accessCodeFacade.update({ id, endDate });

    // #593
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.UPDATE_ACCESS_CODE,
      { accessCodeId: updated.id, accessCode: updated.code },
      admin,
    );

    return updated;
  }
}
