import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AccessCodeExceptionMessages } from 'src/modules/organization/exceptions/access-codes.exceptions';
import { IAccessCodeModel } from 'src/modules/organization/models/access-code.model';
import { AccessCodeFacade } from 'src/modules/organization/services/access-code.facade';

@Injectable()
export class GetAccessCodeUseCase implements IUseCaseService<IAccessCodeModel> {
  constructor(
    private readonly accessCodeFacade: AccessCodeFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(id: string): Promise<IAccessCodeModel> {
    const accessCode = await this.accessCodeFacade.find({ id });

    if (!accessCode) {
      this.exceptionService.notFoundException(
        AccessCodeExceptionMessages.ACCESS_CODE_001,
      );
    }

    return accessCode;
  }
}
