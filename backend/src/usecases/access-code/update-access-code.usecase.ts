import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AccessCodeExceptionMessages } from 'src/modules/organization/exceptions/access-codes.exceptions';
import {
  IAccessCodeModel,
  IUpdateAccessCodeModel,
} from 'src/modules/organization/models/access-code.model';
import { AccessCodeFacade } from 'src/modules/organization/services/access-code.facade';

@Injectable()
export class UpdateAccessCodeUseCase
  implements IUseCaseService<IAccessCodeModel>
{
  constructor(
    private readonly accessCodeFacade: AccessCodeFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    updateAccessCodeModel: IUpdateAccessCodeModel,
  ): Promise<IAccessCodeModel> {
    const updated = this.accessCodeFacade.update(updateAccessCodeModel);

    if (!updated) {
      this.exceptionService.notFoundException(
        AccessCodeExceptionMessages.ACCESS_CODE_001,
      );
    }

    return updated;
  }
}
