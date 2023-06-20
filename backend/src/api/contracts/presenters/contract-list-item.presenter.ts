import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { compareAsc } from 'date-fns';
import { IdAndNamePresenter } from 'src/infrastructure/presenters/id-name.presenter';
import { ClientContractStatus } from 'src/modules/documents/enums/client-contract-status.enum';
import { ContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { IContractModel } from 'src/modules/documents/models/contract.model';

export class ContractListItemPresenter {
  constructor(contract: IContractModel) {
    this.id = contract.id;
    this.contractNumber = contract.contractNumber;
    this.startDate = contract.startDate;
    this.endDate = contract.endDate;
    this.status = this.mapContractStatusToClientContractStatu(contract);
    this.volunteer = new IdAndNamePresenter({
      id: contract.volunteer.id,
      name: contract.volunteer.user.name,
    });
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the contract',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'The contract number',
    example: '000012212',
  })
  contractNumber: string;

  @Expose()
  @ApiProperty({ description: 'The Start Date of the contract' })
  startDate: Date;

  @Expose()
  @ApiProperty({ description: 'The End Date of the contract' })
  endDate: Date;

  @Expose()
  @ApiProperty({
    description: 'The status of the contract',
    enum: ClientContractStatus,
    examples: Object.values(ClientContractStatus),
  })
  status: ClientContractStatus;

  @Expose()
  @ApiProperty({
    type: IdAndNamePresenter,
  })
  volunteer: IdAndNamePresenter<{ id: string; name: string }>;

  private mapContractStatusToClientContractStatu(
    contract: IContractModel,
  ): ClientContractStatus {
    if (contract.status === ContractStatus.APPROVED) {
      // not started
      if (compareAsc(contract.startDate, new Date()) < 0) {
        return ClientContractStatus.NOT_STARTED;
      }

      // active
      if (
        compareAsc(contract.startDate, new Date()) >= 0 &&
        compareAsc(contract.endDate, new Date()) <= 0
      ) {
        return ClientContractStatus.ACTIVE;
      }

      // closed
      if (compareAsc(contract.endDate, new Date()) > 0) {
        return ClientContractStatus.CLOSED;
      }
    }

    if (contract.status === ContractStatus.PENDING_ADMIN) {
      return ClientContractStatus.PENDING_ADMIN;
    }

    if (contract.status === ContractStatus.PENDING_VOLUNTEER) {
      return ClientContractStatus.PENDING_VOLUNTEER;
    }

    if (contract.status === ContractStatus.REJECTED) {
      return ClientContractStatus.REJECTED;
    }
  }
}
