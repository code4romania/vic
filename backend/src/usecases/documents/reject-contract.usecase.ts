import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { ContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { IContractModel } from 'src/modules/documents/models/contract.model';
import { ContractFacade } from 'src/modules/documents/services/contract.facade';
import { GetOneContractUsecase } from './get-one-contract.usecase';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { GetOrganizationUseCaseService } from '../organization/get-organization.usecase';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import RejectContractEvent from 'src/modules/notifications/events/documents/reject-contract.event';

@Injectable()
export class RejectContractUsecase implements IUseCaseService<IContractModel> {
  constructor(
    private readonly getOneContractUsecase: GetOneContractUsecase,
    private readonly contractFacade: ContractFacade,
    private readonly s3Service: S3Service,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly getOrganizationUsecase: GetOrganizationUseCaseService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async execute(
    contractId: string,
    admin: IAdminUserModel,
    rejectionReason: string,
  ): Promise<IContractModel> {
    const organization = await this.getOrganizationUsecase.execute(
      admin.organizationId,
    );

    // 1. check if contract exists
    const contract = await this.getOneContractUsecase.execute({
      id: contractId,
      organizationId: admin.organizationId,
      status: ContractStatus.PENDING_ADMIN,
    });

    // 3. update the contract path and status from datatbase and get the updates
    const newContract = await this.contractFacade.updateContract(contractId, {
      status: ContractStatus.REJECTED,
      rejectedById: admin.id,
      rejectedOn: new Date(),
      rejectionReason,
    });

    // send push notifications and or email
    this.eventEmitter.emit(
      EVENTS.DOCUMENTS.REJECT_CONATRCT,
      new RejectContractEvent(
        organization.id,
        contract.volunteer.user.id,
        organization.name,
        contract.volunteer.user.notificationsSettings.notificationsViaPush,
        contract.volunteer.user.notificationsSettings.notificationsViaEmail,
        contract.volunteer.user.email,
        contract.id,
        rejectionReason || '',
      ),
    );

    // Track event
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.REJECT_CONTRACT,
      {
        organizationId: organization.id,
        organizationName: organization.name,
        contractId,
        oldStatus: ContractStatus.PENDING_ADMIN,
        newStatus: ContractStatus.APPROVED,
        volunteerId: contract.volunteer.id,
        volunteerName: contract.volunteer.user.name,
      },
      admin,
    );

    // 4. generate contract
    return {
      ...newContract,
      path: await this.s3Service.generatePresignedURL(newContract.path),
    };
  }
}
