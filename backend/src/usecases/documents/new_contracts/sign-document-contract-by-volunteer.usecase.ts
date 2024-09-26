import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { DocumentContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';
import { DocumentSignatureFacade } from 'src/modules/documents/services/document-signature.facade';
import { DocumentPDFGenerator } from 'src/modules/documents/services/document-pdf-generator';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ Business Rules for SignDocumentContractByVolunteerUsecase:              │
// │                                                                         │
// │ 1. Volunteer Authentication:                                            │
// │    - The volunteer must exist and be associated with the given          │
// │      organization.                                                      │
// │    - If the volunteer is not found or not part of the organization,     │
// │      throw a not found exception.                                       │
// │                                                                         │s
// │ 2. Contract Validation:                                                 │
// │    - The contract must exist and be in the PENDING_VOLUNTEER_SIGNATURE  │
// │      status.                                                            │
// │    - The contract must be assigned to the current volunteer.            │
// │    - The contract must belong to the user's organization.               │
// │    - If any of these conditions are not met, throw a not found          │
// │      exception.                                                         │
// │                                                                         │
// │ 3. Signature Requirements:                                              │
// │    - A volunteer signature (volunteerSignatureBase64) is mandatory.     │
// │    - A legal guardian signature (legalGuardianSignatureBase64) is       │
// │      optional.                                                          │
// │                                                                         │
// │ 4. Signature Creation:                                                  │
// │    - Create a new signature record for the volunteer using the          │
// │      provided signature.                                                │
// │    - If a legal guardian signature is provided, create a separate       │
// │      signature record for it.                                           │
// │                                                                         │
// │ 5. Contract Update:                                                     │
// │    - Update the contract with the newly created signature IDs.          │
// │    - Change the contract status to PENDING_APPROVAL_NGO.                │
// │                                                                         │
// │ 6. Error Handling:                                                      │
// │    - Any failures in the process should throw appropriate exceptions.   │
// │    - Use the ExceptionsService to handle and throw standardized         │
// │      exceptions.                                                        │
// │                                                                         │
// │ 7. Transactional Integrity:                                             │
// │    - Ensure that all database operations (signature creation and        │
// │      contract update) are performed atomically.                         │
// │    - If any part of the process fails, all changes should be rolled     │
// │      back.                                                              │
// │                                                                         │
// │ 8. Audit Trail:  // TODO: Implement this                                │
// │    - Track the event in an Actions Archive for auditing purposes.       │
// │                                                                         │
// │ 9. Authorization:                                                       │
// │    - Ensure that only the assigned volunteer can sign their own         │
// │      contract.                                                          │
// │                                                                         │
// │ 10. Data Validation: // TODO: Implement this                            │
// │     - Validate the format and content of the signature data before      │
// │       processing.                                                       │
// └─────────────────────────────────────────────────────────────────────────┘

@Injectable()
export class SignDocumentContractByVolunteerUsecase
  implements IUseCaseService<void>
{
  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly documentSignatureFacade: DocumentSignatureFacade,
    private readonly volunteerFacade: VolunteerFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly documentPDFGenerator: DocumentPDFGenerator,
  ) {}

  public async execute({
    contractId,
    userId,
    organizationId,
    volunteerSignatureBase64,
    legalGuardianSignatureBase64,
  }: {
    contractId: string;
    userId: string;
    organizationId: string;
    volunteerSignatureBase64: string;
    legalGuardianSignatureBase64?: string;
  }): Promise<void> {
    // ┌─────────────────────────────────────────────────────────────────────┐
    // │ Verify volunteer existence:                                         │
    // │                                                                     │
    // │ 1. Volunteer must exist and be part of the organization             │
    // │                                                                     │
    // │ This ensures that the volunteer is valid and authorized to sign.    │
    // └─────────────────────────────────────────────────────────────────────┘
    const volunteer = await this.volunteerFacade.find({
      userId: userId,
      organizationId,
    });
    if (!volunteer) {
      this.exceptionService.notFoundException({
        message: 'Volunteer is not part of the organization',
        code_error: 'VOLUNTEER_NOT_PART_OF_ORGANIZATION',
      });
    }

    // ┌─────────────────────────────────────────────────────────────────────┐
    // │ Verify contract existence and eligibility:                          │
    // │                                                                     │
    // │ 1. Status must be PENDING_VOLUNTEER_SIGNATURE                       │
    // │ 2. Contract is assigned to the current volunteer                    │
    // │ 3. Contract belongs to the user's organization                      │
    // │                                                                     │
    // │ This ensures proper authorization and workflow compliance.          │
    // └─────────────────────────────────────────────────────────────────────┘
    const contractExists = await this.documentContractFacade.exists({
      id: contractId,
      volunteerId: volunteer.id,
      organizationId,
      status: DocumentContractStatus.PENDING_VOLUNTEER_SIGNATURE,
    });

    if (!contractExists) {
      this.exceptionService.notFoundException(
        ContractExceptionMessages.CONTRACT_002,
      );
    }

    // ┌─────────────────────────────────────────────────────────────────────┐
    // │ Create signatures:                                                  │
    // │                                                                     │
    // │ 1. Volunteer signature                                              │
    // │ 2. Legal guardian signature (optional)                              │
    // │                                                                     │
    // │ This ensures that both signatures are securely stored.              │
    // └─────────────────────────────────────────────────────────────────────┘
    // Create the volunteer signature
    const volunteerSignatureId = await this.documentSignatureFacade.create({
      userId: userId,
      signature: volunteerSignatureBase64,
    });

    // Create the legal guardian signature
    const legalGuardianSignatureId = legalGuardianSignatureBase64
      ? await this.documentSignatureFacade.create({
          userId: userId,
          signature: legalGuardianSignatureBase64,
        })
      : null;

    // ┌─────────────────────────────────────────────────────────────────────┐
    // │ Update contract:                                                    │
    // │                                                                     │
    // │ 1. Update the contract with the signatures                          │
    // │ 2. Set the status to PENDING_APPROVAL_NGO                           │
    // │                                                                     │
    // │ This ensures that the contract is updated with the signatures and   │
    // │ ready for further processing.                                       │
    // └─────────────────────────────────────────────────────────────────────┘
    await this.documentContractFacade.update(contractId, {
      status: DocumentContractStatus.PENDING_APPROVAL_NGO,
      volunteerSignatureId: volunteerSignatureId,
      legalGuardianSignatureId: legalGuardianSignatureId,
    });

    await this.documentPDFGenerator.generateContractPDF(contractId);

    // Track event in Actions Archive

    return;
  }
}
