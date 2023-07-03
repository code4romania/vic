import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { FindContractOptions } from 'src/modules/documents/models/contract.model';
import { ContractFacade } from 'src/modules/documents/services/contract.facade';

@Injectable()
export class CountPendingContractsUsecase implements IUseCaseService<number> {
  constructor(private readonly contractFacade: ContractFacade) {}

  public async execute(findOptions: FindContractOptions): Promise<number> {
    return this.contractFacade.count({
      ...findOptions,
      statuses: [
        ContractStatus.PENDING_ADMIN,
        ContractStatus.PENDING_VOLUNTEER,
      ],
    });
  }
}
