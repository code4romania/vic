import { Injectable } from '@nestjs/common';
import { DocumentContractStatistics } from 'src/modules/documents/models/document-contract.model';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';

@Injectable()
export class GetDocumentContractStatisticsUsecase {
  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
  ) {}

  async execute(organizationId: string): Promise<DocumentContractStatistics> {
    return this.documentContractFacade.statistics(organizationId);
  }
}
