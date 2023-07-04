import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { UserExceptionMessages } from 'src/modules/user/exceptions/exceptions';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import {
  IVolunteerModel,
  JoinOrganizationByAccessCodeModel,
} from 'src/modules/volunteer/model/volunteer.model';
import { CreateVolunteerUseCase } from './create-volunteer.usecase';
import { AccessCodeFacade } from 'src/modules/organization/services/access-code.facade';
import { compareAsc } from 'date-fns';
import { AccessCodeExceptionMessages } from 'src/modules/organization/exceptions/access-codes.exceptions';

@Injectable()
export class JoinOrganizationByAccessCodeUsecase
  implements IUseCaseService<IVolunteerModel>
{
  constructor(
    private readonly userFacade: UserFacadeService,
    private readonly exceptionService: ExceptionsService,
    private readonly accessCodeFacade: AccessCodeFacade,
    private readonly createVolunteerUseCase: CreateVolunteerUseCase,
  ) {}

  public async execute(
    joinByAccessCode: JoinOrganizationByAccessCodeModel,
  ): Promise<IVolunteerModel> {
    // ========================================================================
    // 1: check if the user has the identity data completed, otherwise throw
    // ========================================================================
    const user = await this.userFacade.findRegularUser({
      id: joinByAccessCode.requestedById,
    });

    if (!user.userPersonalData) {
      this.exceptionService.badRequestException(UserExceptionMessages.USER_005);
    }

    // 2. Check if the accessCode is valid
    const accessCode = await this.accessCodeFacade.find({
      code: joinByAccessCode.code,
      organizationId: joinByAccessCode.organizationId,
    });

    // check if the access code is valid (systdate is between startDate and endDate)
    if (!accessCode) {
      this.exceptionService.badRequestException(
        AccessCodeExceptionMessages.ACCESS_CODE_001,
      );
    }

    // check fi the access code is valid
    if (
      compareAsc(accessCode.startDate, new Date()) > 0 ||
      (accessCode.endDate && compareAsc(accessCode.endDate, new Date()) < 0)
    ) {
      this.exceptionService.badRequestException(
        AccessCodeExceptionMessages.ACCESS_CODE_001,
      );
    }

    // 3. Create volunteer user for the organization
    const volunteer = await this.createVolunteerUseCase.execute({
      organizationId: joinByAccessCode.organizationId,
      userId: joinByAccessCode.requestedById,
    });

    // 4. update access code uses
    await this.accessCodeFacade.update({
      id: accessCode.id,
      usageCount: accessCode.usageCount + 1,
    });

    return volunteer;
  }
}
