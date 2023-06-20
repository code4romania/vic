import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IdAndNamePresenter } from 'src/infrastructure/presenters/id-name.presenter';
import { IContractModel } from 'src/modules/documents/models/contract.model';
import { ContractListItemPresenter } from './contract-list-item.presenter';

export class ContractPresenter extends ContractListItemPresenter {
  constructor(contract: IContractModel) {
    super(contract);
    this.createdOn = contract.createdOn;
    this.template = new IdAndNamePresenter({
      id: contract.template.id,
      name: contract.template.name,
    });
    this.createdBy = new IdAndNamePresenter({
      id: contract.createdByAdmin.id,
      name: contract.createdByAdmin.name,
    });
  }

  @Expose()
  @ApiProperty({ description: 'Contract creation date' })
  createdOn: Date;

  @Expose()
  @ApiProperty({
    type: IdAndNamePresenter,
  })
  template: IdAndNamePresenter<{ id: string; name: string }>;

  @Expose()
  @ApiProperty({
    type: IdAndNamePresenter,
  })
  createdBy: IdAndNamePresenter<{ id: string; name: string }>;
}
