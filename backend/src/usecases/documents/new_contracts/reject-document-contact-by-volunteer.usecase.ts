import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { DocumentContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ Business Rules for RejectDocumentContractByVolunteerUsecase:            │
// │                                                                         │
// │ 1. Volunteer Authentication:                                            │
// │    - The volunteer must exist and be associated with the given          │
// │      organization.                                                      │
// │    - If the volunteer is not found or not part of the organization,     │
// │      throw a not found exception.                                       │
// │                                                                         │
// │ 2. Contract Validation:                                                 │
// │    - The contract must exist and be in the PENDING_VOLUNTEER_SIGNATURE  │
// │      status.                                                            │
// │    - The contract must be assigned to the current volunteer.            │
// │    - The contract must belong to the user's organization.               │
// │    - If any of these conditions are not met, throw a not found          │
// │      exception.                                                         │
// │                                                                         │
// │ 4. Contract Update:                                                     │
// │    - Update the contract status to REJECTED_BY_VOLUNTEER.               │
// │                                                                         │
// │ 5. Error Handling:                                                      │
// │    - Any failures in the process should throw appropriate exceptions.   │
// │    - Use the ExceptionsService to handle and throw standardized         │
// │      exceptions.                                                        │
// │                                                                         │
// │ 6. Transactional Integrity:  // TODO: Implement this                    │
// │    - Ensure that all database operations are performed atomically.      │
// │    - If any part of the process fails, all changes should be rolled     │
// │      back.                                                              │
// │                                                                         │
// │ 7. Audit Trail: // TODO: Implement this                                 │
// │    - Track the rejection event in an Actions Archive for auditing       │
// │      purposes.                                                          │
// │    - Store the rejection reason in the Actions Archive.                 │
// │                                                                         │
// │ 8. Authorization:                                                       │
// │    - Ensure that only the assigned volunteer can reject their own       │
// │      contract.                                                          │
// │                                                                         │
// │ 9. Notification:                                                        │
// │    - Notify relevant parties (e.g., NGO administrators) about the       │
// │      contract rejection.                                                │
// │                                                                         │
// │ 10. Data Validation:                                                    │
// │     - Validate the format and content of the rejection reason before    │
// │       processing.                                                       │
// └─────────────────────────────────────────────────────────────────────────┘

@Injectable()
export class RejectDocumentContractByVolunteerUsecase
  implements IUseCaseService<void>
{
  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly volunteerFacade: VolunteerFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute({
    contractId,
    userId,
    organizationId,
    rejectionReason,
  }: {
    contractId: string;
    userId: string;
    organizationId: string;
    rejectionReason: string;
  }): Promise<void> {
    /* ┌─────────────────────────────────────────────────────────────────────┐
     * │ Verify volunteer existence:                                         │
     * │                                                                     │
     * │ 1. Volunteer must exist and be part of the organization             │
     * │                                                                     │
     * │ This ensures that the volunteer is valid and authorized to reject.  │
     * └─────────────────────────────────────────────────────────────────────┘
     */
    const volunteer = await this.volunteerFacade.find({
      userId: userId,
      organizationId,
    });
    if (!volunteer) {
      this.exceptionService.badRequestException(
        VolunteerExceptionMessages.VOLUNTEER_005,
      );
    }

    /* ┌─────────────────────────────────────────────────────────────────────┐
     * │ Verify contract existence and eligibility:                          │
     * │                                                                     │
     * │ 1. Status must be PENDING_VOLUNTEER_SIGNATURE                       │
     * │ 2. Contract is assigned to the current volunteer                    │
     * │ 3. Contract belongs to the user's organization                      │
     * │                                                                     │
     * │ This ensures that the contract is valid and authorized to be        │
     * │ rejected.                                                           │
     * └─────────────────────────────────────────────────────────────────────┘
     */
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

    /* ┌─────────────────────────────────────────────────────────────────────┐
     * │ Update contract status:                                             │
     * │                                                                     │
     * │ 1. Update the contract status to REJECTED_VOLUNTEER.                │
     * └─────────────────────────────────────────────────────────────────────┘
     */
    const contract =
      await this.documentContractFacade.rejectDocumentContractByVolunteer(
        contractId,
        rejectionReason,
        userId,
      );

    /* ┌─────────────────────────────────────────────────────────────────────┐
     * │ Audit trail logging:                                                │
     * │                                                                     │
     * │ 1. Log the contract rejection event in the Actions Archive together │
     * │    with the rejection reason.                                       │
     * └─────────────────────────────────────────────────────────────────────┘
     */
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.REJECT_DOCUMENT_CONTRACT_BY_VOLUNTEER,
      {
        documentContractId: contract.id,
        documentContractNumber: contract.documentNumber,
        volunteerId: volunteer.id,
        volunteerName: volunteer.user.name,
        rejectionReason,
        organizationId,
      },
      volunteer.user,
      organizationId,
    );

    // TODO: Implement notification to relevant parties

    return;
  }
}
