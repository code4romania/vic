import { Injectable } from '@nestjs/common';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { IDocumentContractItemModel } from 'src/modules/documents/models/document-contract-item-view.model';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

@Injectable()
export class GetOneDocumentContractForVolunteerUsecase {
  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly volunteerFacade: VolunteerFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly s3Service: S3Service,
  ) {}

  async execute({
    documentContractId,
    userId,
    organizationId,
  }: {
    documentContractId: string;
    userId: string;
    organizationId: string;
  }): Promise<IDocumentContractItemModel> {
    const volunteer = await this.volunteerFacade.find({
      userId: userId,
      organizationId,
    });

    if (!volunteer) {
      this.exceptionService.notFoundException(
        VolunteerExceptionMessages.VOLUNTEER_001,
      );
    }

    const contract = await this.documentContractFacade.findOneItem({
      documentId: documentContractId,
      organizationId,
      volunteerId: volunteer.id,
    });

    if (!contract) {
      this.exceptionService.notFoundException(
        ContractExceptionMessages.CONTRACT_002,
      );
    }

    const contractWithPath = {
      ...contract,
      documentFilePath: contract.documentFilePath
        ? await this.s3Service.generatePresignedURL(contract.documentFilePath)
        : null,
    };

    return contractWithPath;
  }
}
