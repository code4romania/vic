import { Injectable, Logger } from '@nestjs/common';
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
import RejectContractEvent from 'src/modules/notifications/events/documents/reject-contract.event';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import * as Sentry from '@sentry/node';

@Injectable()
export class RejectDocumentContractByNgoUsecase
  implements IUseCaseService<void>
{
  private readonly logger = new Logger(RejectDocumentContractByNgoUsecase.name);
  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly eventEmitter: EventEmitter2,
    private readonly volunteerFacade: VolunteerFacade,
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
      this.exceptionService.badRequestException(
        ContractExceptionMessages.CONTRACT_016,
      );
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
      Sentry.captureException(error);
      this.logger.error(
        `Error while rejecting the contract by NGO ${error?.message}`,
      );
      this.exceptionService.internalServerErrorException(
        ContractExceptionMessages.CONTRACT_017,
      );
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

    // get volunteer data to build the mail/notification subject/body
    const volunteer = await this.volunteerFacade.find({
      id: updatedContract.volunteerId,
    });

    // send push notifications and or email
    this.eventEmitter.emit(
      EVENTS.DOCUMENTS.REJECT_CONTRACT_BY_NGO,
      new RejectContractEvent(
        contract.organizationId,
        volunteer.user.id,
        volunteer.organization.name,
        volunteer.user.notificationsSettings.notificationsViaPush,
        volunteer.user.notificationsSettings.notificationsViaEmail,
        volunteer.user.email,
        contract.id,
        rejectionReason || '',
      ),
    );
  }
}
