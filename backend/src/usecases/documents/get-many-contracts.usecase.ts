import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  FindManyContractOptions,
  IContractModel,
} from 'src/modules/documents/models/contract.model';
import { ContractFacade } from 'src/modules/documents/services/contract.facade';

@Injectable()
export class GetManyContractsUsecase
  implements IUseCaseService<Pagination<IContractModel>>
{
  constructor(private readonly contractFacade: ContractFacade) {}

  public async execute(
    findOptions: FindManyContractOptions,
  ): Promise<Pagination<IContractModel>> {
    return this.contractFacade.findMany(findOptions);
  }
}
