import { Injectable } from '@nestjs/common';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { IDocumentContractWebItemModel } from 'src/modules/documents/models/document-contract-web-item.model';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';

@Injectable()
export class GetOneDocumentContractForNgoUsecase {
  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  async execute({
    documentContractId,
    organizationId,
  }: {
    documentContractId: string;
    organizationId: string;
  }): Promise<IDocumentContractWebItemModel> {
    const contract = await this.documentContractFacade.findOneForWeb({
      documentId: documentContractId,
      organizationId,
    });

    if (!contract) {
      this.exceptionService.notFoundException(
        ContractExceptionMessages.CONTRACT_002,
      );
    }

    return contract;
  }
}
