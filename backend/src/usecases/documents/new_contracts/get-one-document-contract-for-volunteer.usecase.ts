import { Injectable } from '@nestjs/common';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { DocumentContractListViewEntity } from 'src/modules/documents/entities/document-contract-list-view.entity';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

@Injectable()
export class GetOneDocumentContractForVolunteerUsecase {
  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly volunteerFacade: VolunteerFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  async execute({
    documentContractId,
    userId,
    organizationId,
  }: {
    documentContractId: string;
    userId: string;
    organizationId: string;
  }): Promise<DocumentContractListViewEntity> {
    const volunteer = await this.volunteerFacade.find({
      userId: userId,
      organizationId,
    });

    if (!volunteer) {
      this.exceptionService.notFoundException(
        VolunteerExceptionMessages.VOLUNTEER_001,
      );
    }

    const contract = await this.documentContractFacade.findOneForVolunteer({
      documentId: documentContractId,
      volunteerId: volunteer.id,
    });

    if (!contract) {
      this.exceptionService.notFoundException(
        ContractExceptionMessages.CONTRACT_002,
      );
    }

    return contract;
  }
}
