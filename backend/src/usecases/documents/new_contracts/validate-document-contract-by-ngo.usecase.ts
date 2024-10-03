import { Injectable, Logger } from '@nestjs/common';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { DocumentContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { IDocumentContractModel } from 'src/modules/documents/models/document-contract.model';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import * as Sentry from '@sentry/node';

@Injectable()
export class ValidateDocumentContractByNgoUsecase {
  private readonly logger = new Logger(
    ValidateDocumentContractByNgoUsecase.name,
  );

  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  async execute(
    documentContractId: string,
    admin: IAdminUserModel,
  ): Promise<void> {
    const exists = await this.documentContractFacade.exists({
      id: documentContractId,
      organizationId: admin.organizationId,
      status: DocumentContractStatus.PENDING_APPROVAL_NGO,
    });

    if (!exists) {
      this.exceptionService.notFoundException(
        ContractExceptionMessages.CONTRACT_002,
      );
    }

    let contract: IDocumentContractModel;
    try {
      contract =
        await this.documentContractFacade.approveDocumentContractByNGO(
          documentContractId,
        );
    } catch (error) {
      Sentry.captureException(error);
      this.logger.error(
        `Error while approving the contract by NGO ${error?.message}`,
      );
      this.exceptionService.internalServerErrorException(
        ContractExceptionMessages.CONTRACT_019,
      );
    }

    // Track APPROVE contract event
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.VALIDATE_DOCUMENT_CONTRACT,
      {
        organizationId: admin.organizationId,
        documentContractId: contract.id,
        documentContractNumber: contract.documentNumber,
        volunteerId: contract.volunteerId,
        volunteerName: contract.volunteerData.name,
      },
      admin,
    );
  }
}
