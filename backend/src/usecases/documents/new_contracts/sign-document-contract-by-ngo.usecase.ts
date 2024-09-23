import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { DocumentContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';
import { DocumentSignatureFacade } from 'src/modules/documents/services/document-signature.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';

@Injectable()
export class SignDocumentContractByNgoUsecase implements IUseCaseService<void> {
  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly documentSignatureFacade: DocumentSignatureFacade,
    private readonly exceptionService: ExceptionsService,
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

    try {
      const signatureId = await this.documentSignatureFacade.create({
        userId: admin.id,
        signature: signatureBase64,
      });

      await this.documentContractFacade.signDocumentContractByNGO(
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

    // TODO: Send notification to Volunteer (Contract is now active)
    // TODO: Track Event
  }
}
