import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  FindManyDocumentContractListViewOptions,
  IDocumentContractListViewModel,
} from 'src/modules/documents/models/document-contract-list-view.model';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';

@Injectable()
export class GetManyDocumentContractsUsecase
  implements IUseCaseService<Pagination<IDocumentContractListViewModel>>
{
  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
  ) {}

  public async execute(
    findOptions: FindManyDocumentContractListViewOptions,
  ): Promise<Pagination<IDocumentContractListViewModel>> {
    return this.documentContractFacade.findMany(findOptions);
  }
}
