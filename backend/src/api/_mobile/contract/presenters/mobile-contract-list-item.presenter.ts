import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IContractModel } from 'src/modules/documents/models/contract.model';

export class MobileContractListItemPresenter {
  constructor(contract: IContractModel) {
    this.id = contract.id;
    this.contractNumber = contract.contractNumber;
    this.startDate = contract.startDate;
    this.endDate = contract.endDate;
    this.path = contract.path;
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
}
