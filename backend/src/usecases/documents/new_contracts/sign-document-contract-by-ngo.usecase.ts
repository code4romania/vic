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
export class SignDocumentContractByNgoUsecase implements IUseCaseService<void> {
  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute(
    documentContractId: string,
    admin: IAdminUserModel,
  ): Promise<void> {
    const exists = await this.documentContractFacade.findOne({
      id: documentContractId,
      organizationId: admin.organizationId,
      status: DocumentContractStatus.PENDING_NGO_REPRESENTATIVE_SIGNATURE,
    });

    if (!exists) {
      this.exceptionService.notFoundException(
        ContractExceptionMessages.CONTRACT_002,
      );
    }

    let contract: IDocumentContractModel;
    try {
      contract =
        await this.documentContractFacade.signDocumentContractByNGO(
          documentContractId,
        );
    } catch (error) {
      // TODO: Update error
      this.exceptionService.internalServerErrorException({
        message: `Error while sigining the contract by NGO ${error?.message}`,
        code_error: 'SIGN_DOCUMENT_CONTRACT_BY_NGO_003',
      });
    }

    // TODO: Send notification to Volunteer (Contract is now active)

    // Sign Document Contract by NGO
    await this.actionsArchiveFacade.trackEvent(
      TrackedEventName.SIGN_DOCUMENT_CONTRACT_BY_NGO,
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
