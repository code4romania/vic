import { Injectable, Logger } from '@nestjs/common';
import { JSONStringifyError } from 'src/common/helpers/utils';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { GetOneContractUsecase } from './get-one-contract.usecase';
import { ContractFacade } from 'src/modules/documents/services/contract.facade';
import { ContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { GetOneTemplateUseCase } from './get-one-template.usecase';
import { IContractModel } from 'src/modules/documents/models/contract.model';

@Injectable()
export class CancelContractUsecase implements IUseCaseService<IContractModel> {
  private readonly logger = new Logger(CancelContractUsecase.name);
  constructor(
    private readonly getOneContractUsecase: GetOneContractUsecase,
    private readonly contractFacade: ContractFacade,
    private readonly exceptionsService: ExceptionsService,
    private readonly getOneTemplateUsecase: GetOneTemplateUseCase,
    private readonly s3Service: S3Service,
  ) {}

  public async execute(
    id: string,
    organizationId: string,
  ): Promise<IContractModel> {
    // 1. Find the contract
    const contract = await this.getOneContractUsecase.execute({
      id,
      organizationId,
    });

    // 2. check if the contract is pending admin
    if (contract.status !== ContractStatus.PENDING_ADMIN) {
      this.exceptionsService.badRequestException(
        ContractExceptionMessages.CONTRACT_007,
      );
    }

    // 3. get contract template
    const template = await this.getOneTemplateUsecase.execute({
      id: contract.templateId,
    });

    try {
      // 4. delete template file
      await this.s3Service.deleteFile(contract.path);

      // 4. Delete the template
      const updatedContract = await this.contractFacade.updateContract(
        contract.id,
        { path: template.path, status: ContractStatus.PENDING_VOLUNTEER },
      );

      return updatedContract;
    } catch (error) {
      this.logger.error({
        ...ContractExceptionMessages.CONTRACT_003,
        error: JSONStringifyError(error),
      });
      this.exceptionsService.badRequestException(
        ContractExceptionMessages.CONTRACT_003,
      );
    }
  }
}
