import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IContractModel } from 'src/modules/documents/models/contract.model';
import { MobileContractListItemPresenter } from './mobile-contract-list-item.presenter';

export class MobileContractPresenter extends MobileContractListItemPresenter {
  constructor(contract: IContractModel) {
    super(contract);
    this.rejectionReason = contract.rejectionReason;
  }

  @Expose()
  @ApiProperty({
    description: 'The rejection reason',
  })
  rejectionReason?: string;
}
