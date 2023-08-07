import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IdAndNamePresenter } from 'src/infrastructure/presenters/id-name.presenter';
import { IContractModel } from 'src/modules/documents/models/contract.model';
import { ContractListItemPresenter } from './contract-list-item.presenter';

export class ContractPresenter extends ContractListItemPresenter {
  constructor(contract: IContractModel) {
    super(contract);
    this.createdOn = contract.createdOn;
    this.approvedOn = contract.approvedOn;
    this.template = contract.template
      ? new IdAndNamePresenter({
          id: contract.template.id,
          name: contract.template.name,
        })
      : null;
    this.createdBy = new IdAndNamePresenter({
      id: contract.createdByAdmin.id,
      name: contract.createdByAdmin.name,
    });
    this.rejectedBy = contract?.rejectedBy
      ? new IdAndNamePresenter({
          id: contract.rejectedBy.id,
          name: contract.rejectedBy.name,
        })
      : null;
    this.rejectedOn = contract.rejectedOn;
    this.rejectionReason = contract.rejectionReason;
  }

  @Expose()
  @ApiProperty({ description: 'Contract creation date' })
  createdOn: Date;

  @Expose()
  @ApiProperty({ description: 'Contract approval date' })
  approvedOn?: Date;

  @Expose()
  @ApiProperty({ description: 'Contract rejection date' })
  rejectedOn?: Date;

  @Expose()
  @ApiProperty({ description: 'Contract rejection reason' })
  rejectionReason?: string;

  @Expose()
  @ApiProperty({
    type: IdAndNamePresenter,
  })
  template: IdAndNamePresenter<{ id: string; name: string }>;

  @Expose()
  @ApiProperty({
    type: IdAndNamePresenter,
  })
  rejectedBy?: IdAndNamePresenter<{ id: string; name: string }>;

  @Expose()
  @ApiProperty({
    type: IdAndNamePresenter,
  })
  createdBy: IdAndNamePresenter<{ id: string; name: string }>;
}
