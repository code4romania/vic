import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { DocumentContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { IDocumentContractModel } from 'src/modules/documents/models/document-contract.model';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';

@Injectable()
export class RejectDocumentContractByNgoUsecase
  implements IUseCaseService<void>
{
  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute({
    documentContractId,
    organizationId,
    rejectionReason,
    admin,
  }: {
    documentContractId: string;
    organizationId: string;
    rejectionReason?: string;
    admin: IAdminUserModel;
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

    let updatedContract: IDocumentContractModel;
    try {
      updatedContract =
        await this.documentContractFacade.rejectDocumentContractByNGO(
          documentContractId,
          rejectionReason,
          admin.id,
        );
    } catch (error) {
      // TODO: Update error
      this.exceptionService.internalServerErrorException({
        message: `Error while rejecting the contract by NGO ${error?.message}`,
        code_error: 'REJECT_DOCUMENT_CONTRACT_BY_NGO_002',
      });
    }

    // Track Rejection Event including Rejection Reason
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.REJECT_DOCUMENT_CONTRACT_BY_NGO,
      {
        organizationId,
        rejectionReason,
        volunteerId: updatedContract.volunteerId,
        volunteerName: updatedContract.volunteerData.name,
        documentContractId: updatedContract.id,
        documentContractNumber: updatedContract.documentNumber,
      },
      admin,
    );

    // TODO: Send notification to Volunteer including Rejection Reason if exists (Contract was rejected)

    console.log(rejectionReason);
  }
}