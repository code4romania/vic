import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AccessCodeExceptionMessages } from 'src/modules/organization/exceptions/access-codes.exceptions';
import {
  IAccessCodeModel,
  ICreateAccessCodeModel,
} from 'src/modules/organization/models/access-code.model';
import { AccessCodeFacade } from 'src/modules/organization/services/access-code.facade';

@Injectable()
export class CreateAccessCodeUseCase
  implements IUseCaseService<IAccessCodeModel>
{
  constructor(
    private readonly accessCodeFacade: AccessCodeFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    createAccessCodeModel: ICreateAccessCodeModel,
  ): Promise<IAccessCodeModel> {
    const accessCode = await this.accessCodeFacade.find({
      code: createAccessCodeModel.code,
      organizationId: createAccessCodeModel.organizationId,
    });

    if (accessCode) {
      this.exceptionService.badRequestException(
        AccessCodeExceptionMessages.ACCESS_CODE_002,
      );
    }

    return this.accessCodeFacade.create(createAccessCodeModel);
  }
}
