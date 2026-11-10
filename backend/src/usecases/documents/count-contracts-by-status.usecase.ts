import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ClientContractStatus } from 'src/modules/documents/enums/client-contract-status.enum';
import { ContractFacade } from 'src/modules/documents/services/contract.facade';

export type ContractCounters = Record<ClientContractStatus, number>;

// The counters on top of "Contracte și documente": signed, pending and expired.
@Injectable()
export class CountContractsByStatusUsecase
  implements IUseCaseService<ContractCounters>
{
  constructor(private readonly contractFacade: ContractFacade) {}

  public async execute({
    organizationId,
  }: {
    organizationId: string;
  }): Promise<ContractCounters> {
    const statuses = Object.values(ClientContractStatus);
    const counts = await Promise.all(
      statuses.map((status) =>
        this.contractFacade.countByStatus(organizationId, status),
      ),
    );
    return Object.fromEntries(
      statuses.map((status, index) => [status, counts[index]]),
    ) as ContractCounters;
  }
}
