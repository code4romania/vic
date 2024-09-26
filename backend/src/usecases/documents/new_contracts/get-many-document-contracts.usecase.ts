import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import {
  FindManyDocumentContractListViewPaginatedOptions,
  IDocumentContractListViewModel,
} from 'src/modules/documents/models/document-contract-list-view.model';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';

@Injectable()
export class GetManyDocumentContractsUsecase
  implements IUseCaseService<Pagination<IDocumentContractListViewModel>>
{
  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly s3Service: S3Service,
  ) {}

  public async execute(
    findOptions: FindManyDocumentContractListViewPaginatedOptions,
  ): Promise<Pagination<IDocumentContractListViewModel>> {
    const contracts =
      await this.documentContractFacade.findManyPaginated(findOptions);

    const contractsWithPath = await Promise.all(
      contracts.items.map(async (contract) => {
        return {
          ...contract,
          documentFilePath: contract.documentFilePath
            ? await this.s3Service.generatePresignedURL(
                contract.documentFilePath,
              )
            : null,
        };
      }),
    );

    return {
      ...contracts,
      items: contractsWithPath,
    };
  }
}
