import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { AccessCodeExceptionMessages } from 'src/modules/organization/exceptions/access-codes.exceptions';
import {
  IAccessCodeModel,
  ICreateAccessCodeModel,
} from 'src/modules/organization/models/access-code.model';
import { AccessCodeFacade } from 'src/modules/organization/services/access-code.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { assertAccessCodePeriod } from './access-code-period';
import { OrganizationGateService } from '../organization/organization-gate.service';

@Injectable()
export class CreateAccessCodeUseCase
  implements IUseCaseService<IAccessCodeModel>
{
  constructor(
    private readonly accessCodeFacade: AccessCodeFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly organizationGate: OrganizationGateService,
  ) {}

  public async execute(
    createAccessCodeModel: ICreateAccessCodeModel,
    admin: IAdminUserModel,
  ): Promise<IAccessCodeModel> {
    // No way in to an NGO a super admin has not validated (403 ORG_005)
    await this.organizationGate.assertValidated(
      createAccessCodeModel.organizationId,
    );

    assertAccessCodePeriod(
      createAccessCodeModel.startDate,
      createAccessCodeModel.endDate,
      this.exceptionService,
    );

    const accessCode = await this.accessCodeFacade.find({
      code: createAccessCodeModel.code,
      organizationId: createAccessCodeModel.organizationId,
    });

    if (accessCode) {
      this.exceptionService.badRequestException(
        AccessCodeExceptionMessages.ACCESS_CODE_002,
      );
    }

    const created = await this.accessCodeFacade.create(createAccessCodeModel);

    // #593
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.CREATE_ACCESS_CODE,
      { accessCodeId: created.id, accessCode: created.code },
      admin,
    );

    return created;
  }
}
