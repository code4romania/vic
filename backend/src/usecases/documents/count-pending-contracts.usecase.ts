import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ClientContractStatus } from 'src/modules/documents/enums/client-contract-status.enum';
import { ContractFacade } from 'src/modules/documents/services/contract.facade';

// #488: the contracts shown as "În așteptare" (not signed yet and not past their end date).
@Injectable()
export class CountPendingContractsUsecase implements IUseCaseService<number> {
  constructor(private readonly contractFacade: ContractFacade) {}

  public async execute({
    organizationId,
  }: {
    organizationId: string;
  }): Promise<number> {
    return this.contractFacade.countByStatus(
      organizationId,
      ClientContractStatus.PENDING,
    );
  }
}
