import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { DocumentContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import { DocumentSignatureFacade } from 'src/modules/documents/services/document-signature.facade';
import { DocumentPDFGenerator } from 'src/modules/documents/services/document-pdf-generator';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { IDocumentContractModel } from 'src/modules/documents/models/document-contract.model';
import SignContractEvent from 'src/modules/notifications/events/documents/sign-contract.event';

@Injectable()
export class SignDocumentContractByNgoUsecase implements IUseCaseService<void> {
  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly documentSignatureFacade: DocumentSignatureFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly eventEmitter: EventEmitter2,
    private readonly documentPDFGenerator: DocumentPDFGenerator,
    private readonly volunteerFacade: VolunteerFacade,
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

    await this.documentPDFGenerator.generateContractPDF(documentContractId);

    // Sign Document Contract by NGO
    this.actionsArchiveFacade.trackEvent(
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

    // get volunteer data to build the mail/notification subject/body
    const volunteer = await this.volunteerFacade.find({
      id: contract.volunteerId,
    });

    // send push notifications and or email
    this.eventEmitter.emit(
      EVENTS.DOCUMENTS.SIGN_CONTRACT_BY_NGO,
      new SignContractEvent(
        contract.organizationId,
        volunteer.user.id,
        volunteer.organization.name,
        volunteer.user.notificationsSettings.notificationsViaPush,
        volunteer.user.notificationsSettings.notificationsViaEmail,
        volunteer.user.email,
        contract.id,
      ),
    );
  }
}
