import { Injectable, Logger } from '@nestjs/common';
import { JSONStringifyError } from 'src/common/helpers/utils';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { DocumentContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';

@Injectable()
export class DeleteDocumentContractUsecase implements IUseCaseService<string> {
  private readonly logger = new Logger(DeleteDocumentContractUsecase.name);
  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute(id: string, admin: IAdminUserModel): Promise<void> {
    try {
      // 1. Does the contract exists in the callers' organization?
      const contract = await this.documentContractFacade.findOne({
        id,
        organizationId: admin.organizationId,
      });

      if (!contract) {
        this.exceptionService.notFoundException(
          ContractExceptionMessages.CONTRACT_002,
        );
      }

      // 2. Status of the contract must not be signed by any of the parties
      if (
        [
          DocumentContractStatus.PENDING_APPROVAL_NGO,
          DocumentContractStatus.PENDING_NGO_REPRESENTATIVE_SIGNATURE,
          DocumentContractStatus.APPROVED,
          DocumentContractStatus.REJECTED_NGO,
          DocumentContractStatus.ACTION_EXPIRED,
        ].includes(contract.status)
      ) {
        this.exceptionService.badRequestException(
          ContractExceptionMessages.CONTRACT_014,
        );
      }

      await this.documentContractFacade.delete(id);

      // 10. Track event
      this.actionsArchiveFacade.trackEvent(
        TrackedEventName.DELETE_DOCUMENT_CONTRACT,
        {
          organizationId: contract.organizationId,
          volunteerId: contract.volunteerId,
          volunteerName: contract.volunteer.user.name,
          documentContractId: contract.id,
          documentContractNumber: contract.documentNumber,
        },
        admin,
      );
    } catch (error) {
      if (error?.status === 400) {
        // Rethrow errors that we've thrown above, and catch the others
        throw error;
      }

      this.logger.error({
        ...ContractExceptionMessages.CONTRACT_015,
        error: JSONStringifyError(error),
      });
      this.exceptionService.internalServerErrorException({
        ...ContractExceptionMessages.CONTRACT_015,
        details: JSONStringifyError(error),
      });
    }
  }
}
