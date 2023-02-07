import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';

import {
  IAccessCodeModel,
  IFindAllAccessCodeModel,
} from 'src/modules/organization/models/access-code.model';
import { AccessCodeFacade } from 'src/modules/organization/services/access-code.facade';

@Injectable()
export class GetAllAccessCodeUseCase
  implements IUseCaseService<IAccessCodeModel[]>
{
  constructor(private readonly accessCodeFacade: AccessCodeFacade) {}

  public async execute(
    findOptions: IFindAllAccessCodeModel,
  ): Promise<IAccessCodeModel[]> {
    return this.accessCodeFacade.findAll(findOptions);
  }
}
