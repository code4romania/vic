import { Injectable } from '@nestjs/common';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { DocumentContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';

@Injectable()
export class ApproveDocumentContractByNgoUsecase {
  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  async execute(
    documentContractId: string,
    organizationId: string,
  ): Promise<void> {
    const exists = await this.documentContractFacade.exists({
      id: documentContractId,
      organizationId,
      status: DocumentContractStatus.PENDING_APPROVAL_NGO,
    });

    if (!exists) {
      this.exceptionService.notFoundException(
        ContractExceptionMessages.CONTRACT_002,
      );
    }
    try {
      await this.documentContractFacade.approveDocumentContractByNGO(
        documentContractId,
      );
    } catch (error) {
      // TODO: Update error
      this.exceptionService.internalServerErrorException({
        message: `Error while approving the contract by NGO ${error?.message}`,
        code_error: 'APPROVE_DOCUMENT_CONTRACT_BY_NGO_001',
      });
    }

    // TODO: Track event
  }
}
