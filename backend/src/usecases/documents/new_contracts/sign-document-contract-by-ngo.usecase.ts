import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { DocumentContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';

@Injectable()
export class SignDocumentContractByNGO implements IUseCaseService<void> {
  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    documentContractId: string,
    organizationId: string,
  ): Promise<void> {
    const exists = await this.documentContractFacade.exists({
      id: documentContractId,
      organizationId,
      status: DocumentContractStatus.PENDING_NGO_REPRESENTATIVE_SIGNATURE,
    });

    if (!exists) {
      this.exceptionService.notFoundException(
        ContractExceptionMessages.CONTRACT_002,
      );
    }

    try {
      await this.documentContractFacade.signDocumentContractByNGO(
        documentContractId,
      );
    } catch (error) {
      // TODO: Update error
      this.exceptionService.internalServerErrorException({
        message: `Error while approving the contract by NGO ${error?.message}`,
        code_error: 'APPROVE_DOCUMENT_CONTRACT_BY_NGO_001',
      });
    }

    // TODO: Send notification to Volunteer (Contract is now active)
    // TODO: Track Event
  }
}
