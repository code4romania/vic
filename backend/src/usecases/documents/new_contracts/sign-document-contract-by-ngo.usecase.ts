import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { DocumentContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { IDocumentContractModel } from 'src/modules/documents/models/document-contract.model';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import ApproveContractEvent from 'src/modules/notifications/events/documents/approve-contract.event';
import { DocumentSignatureFacade } from 'src/modules/documents/services/document-signature.facade';
import { DocumentPDFGenerator } from 'src/modules/documents/services/document-pdf-generator';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';

@Injectable()
export class SignDocumentContractByNgoUsecase implements IUseCaseService<void> {
  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly documentSignatureFacade: DocumentSignatureFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly eventEmitter: EventEmitter2,
    private readonly documentPDFGenerator: DocumentPDFGenerator,
  ) {}

  public async execute(
    documentContractId: string,
    signatureBase64: string,
    admin: IAdminUserModel,
  ): Promise<void> {
    const exists = await this.documentContractFacade.exists({
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
      const signatureId = await this.documentSignatureFacade.create({
        userId: admin.id,
        signature: signatureBase64,
      });

      contract = await this.documentContractFacade.signDocumentContractByNGO(
        documentContractId,
        signatureId,
      );
    } catch (error) {
      // TODO: Update error
      this.exceptionService.internalServerErrorException({
        message: `Error while sigining the contract by NGO ${error?.message}`,
        code_error: 'SIGN_DOCUMENT_CONTRACT_BY_NGO_003',
      });
    }

    this.documentPDFGenerator.generateContractPDF(documentContractId);

    // send push notifications and or email
    this.eventEmitter.emit(
      EVENTS.DOCUMENTS.SIGN_CONTRACT_BY_NGO,
      new ApproveContractEvent(
        contract.organizationId,
        contract.volunteerId,
        contract.volunteer.organization.name,
        contract.volunteer.user.notificationsSettings.notificationsViaPush,
        contract.volunteer.user.notificationsSettings.notificationsViaEmail,
        contract.volunteer.user.email,
        contract.id,
      ),
    );

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
