import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IContractModel,
  mapContractStatusToClientContractStatus,
} from 'src/modules/documents/models/contract.model';
import { ClientContractStatus } from 'src/modules/documents/enums/client-contract-status.enum';

export class MobileContractListItemPresenter {
  constructor(contract: IContractModel) {
    this.id = contract.id;
    this.contractNumber = contract.contractNumber;
    this.startDate = contract.startDate;
    this.endDate = contract.endDate;
    this.path = contract.path;
    this.status = mapContractStatusToClientContractStatus(contract);
    this.contractFileName = contract.fileName;
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
  @ApiProperty({
    description: 'The contract document link',
    example: 'https://doclink',
  })
  path: string;

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
    description: 'The contract fileName',
  })
  contractFileName: string;
}
