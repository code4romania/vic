import { Injectable } from '@nestjs/common';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { IDocumentContractWebItemModel } from 'src/modules/documents/models/document-contract-web-item.model';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';

@Injectable()
export class GetOneDocumentContractForNgoUsecase {
  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly s3Service: S3Service,
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

    const contractWithPath = {
      ...contract,
      documentFilePath: contract.documentFilePath
        ? await this.s3Service.generatePresignedURL(contract.documentFilePath)
        : null,
    };

    return contractWithPath;
  }
}
