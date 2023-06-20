import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { ContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { IContractModel } from 'src/modules/documents/models/contract.model';
import { ContractFacade } from 'src/modules/documents/services/contract.facade';

@Injectable()
export class RejectContractUsecase implements IUseCaseService<IContractModel> {
  constructor(
    private readonly contractFacade: ContractFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly s3Service: S3Service,
  ) {}

  public async execute(
    contractId: string,
    organizationId: string,
    userId: string,
    rejectionReason: string,
  ): Promise<IContractModel> {
    // 1. check if contract exists
    const contract = await this.contractFacade.findOne({
      id: contractId,
      organizationId,
      status: ContractStatus.PENDING_ADMIN,
    });

    if (!contract)
      this.exceptionService.notFoundException(
        ContractExceptionMessages.CONTRACT_002,
      );

    // 3. update the contract path and status from datatbase and get the updates
    const newContract = await this.contractFacade.updateContract(contractId, {
      status: ContractStatus.REJECTED,
      rejectedById: userId,
      rejectedOn: new Date(),
      rejectionReason,
    });

    // 4. generate contract
    return {
      ...newContract,
      path: await this.s3Service.generatePresignedURL(newContract.path),
    };
  }
}
