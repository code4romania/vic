import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { DocumentContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';

@Injectable()
export class RejectDocumentContractByNgoUsecase
  implements IUseCaseService<void>
{
  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute({
    documentContractId,
    organizationId,
    rejectionReason,
  }: {
    documentContractId: string;
    organizationId: string;
    rejectionReason?: string;
  }): Promise<void> {
    const contract = await this.documentContractFacade.findOne({
      id: documentContractId,
      organizationId,
    });

    if (!contract) {
      this.exceptionService.notFoundException(
        ContractExceptionMessages.CONTRACT_002,
      );
    }

    if (
      [
        DocumentContractStatus.PENDING_APPROVAL_NGO,
        DocumentContractStatus.PENDING_NGO_REPRESENTATIVE_SIGNATURE,
      ].includes(contract.status) !== true
    ) {
      // TODO: update error
      this.exceptionService.notFoundException({
        message: 'Only Pending Contracts can be rejected',
        code_error: 'REJECT_DOCUMENT_CONTRACT_BY_NGO_02',
      });
    }

    try {
      await this.documentContractFacade.rejectDocumentContractByNGO(
        documentContractId,
      );
    } catch (error) {
      // TODO: Update error
      this.exceptionService.internalServerErrorException({
        message: `Error while rejecting the contract by NGO ${error?.message}`,
        code_error: 'REJECT_DOCUMENT_CONTRACT_BY_NGO_002',
      });
    }

    // TODO: Send notification to Volunteer including Rejection Reason if exists (Contract was rejected)
    // TODO: Track Rejection Event including Rejection Reason
    console.log(rejectionReason);
  }
}
