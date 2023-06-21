import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import {
  FindManyContractOptions,
  IContractDownloadModel,
  mapContractStatusToClientContractStatus,
} from 'src/modules/documents/models/contract.model';
import { ContractFacade } from 'src/modules/documents/services/contract.facade';

@Injectable()
export class GetContractsForDownloadUsecase
  implements IUseCaseService<IContractDownloadModel[]>
{
  constructor(private readonly contractFacade: ContractFacade) {}

  public async execute(
    findOptions: FindManyContractOptions,
  ): Promise<IContractDownloadModel[]> {
    const contracts = await this.contractFacade.findMany({
      ...findOptions,
      limit: 0,
      page: 0,
    });

    return contracts.items.map((contract): IContractDownloadModel => {
      return {
        'Numar contract': contract.contractNumber,
        Voluntar: contract.volunteer.user.name,
        Status: mapContractStatusToClientContractStatus(contract),
        'Data inceput': contract.startDate,
        'Data final': contract.endDate,
      };
    });
  }
}
