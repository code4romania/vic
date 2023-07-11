import { Injectable, Logger } from '@nestjs/common';
import { S3_FILE_PATHS } from 'src/common/constants/constants';
import { JSONStringifyError } from 'src/common/helpers/utils';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { ContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { IContractModel } from 'src/modules/documents/models/contract.model';
import { ContractFacade } from 'src/modules/documents/services/contract.facade';
import { GetOneContractUsecase } from './get-one-contract.usecase';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { GetOrganizationUseCaseService } from '../organization/get-organization.usecase';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import ApproveContractEvent from 'src/modules/notifications/events/documents/approve-contract.event';

@Injectable()
export class SignAndConfirmContractUsecase
  implements IUseCaseService<IContractModel>
{
  private readonly logger = new Logger(SignAndConfirmContractUsecase.name);

  constructor(
    private readonly getOneContractUsecase: GetOneContractUsecase,
    private readonly contractFacade: ContractFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly s3Service: S3Service,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly getOneOrganizationUseCase: GetOrganizationUseCaseService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async execute(
    contractId: string,
    admin: IAdminUserModel,
    files: Express.Multer.File[],
  ): Promise<IContractModel> {
    const organization = await this.getOneOrganizationUseCase.execute(
      admin.organizationId,
    );

    // 1. check if contract exists
    const contract = await this.getOneContractUsecase.execute({
      id: contractId,
      organizationId: admin.organizationId,
      status: ContractStatus.PENDING_ADMIN,
    });

    try {
      // 2. upload file to s3 and get the path
      const path = await this.s3Service.uploadFile(
        `${S3_FILE_PATHS.CONTRACTS}/${admin.organizationId}`,
        files[0],
      );

      // 3. delete the old contract
      await this.s3Service.deleteFile(contract.path);

      // 3. update the contract path and status from datatbase and get the updates
      const newContract = await this.contractFacade.updateContract(contractId, {
        path,
        approvedById: admin.id,
        approvedOn: new Date(),
        status: ContractStatus.APPROVED,
      });

      // send push notifications and or email
      this.eventEmitter.emit(
        EVENTS.DOCUMENTS.APPROVE_CONTRACT,
        new ApproveContractEvent(
          organization.id,
          contract.volunteer.user.id,
          organization.name,
          contract.volunteer.user.notificationsSettings.notificationsViaPush,
          contract.volunteer.user.notificationsSettings.notificationsViaEmail,
          contract.volunteer.user.email,
          contract.id,
        ),
      );

      // Track event
      this.actionsArchiveFacade.trackEvent(
        TrackedEventName.APPROVE_CONTRACT,
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
    } catch (error) {
      // log error
      this.logger.error({
        ...ContractExceptionMessages.CONTRACT_001,
        error: JSONStringifyError(error),
      });
      // error while uploading file to s3
      this.exceptionService.badRequestException(
        ContractExceptionMessages.CONTRACT_001,
      );
    }
  }
}
