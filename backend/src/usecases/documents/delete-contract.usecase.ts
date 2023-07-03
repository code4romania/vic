import { Injectable, Logger } from '@nestjs/common';
import { JSONStringifyError } from 'src/common/helpers/utils';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { GetOneContractUsecase } from './get-one-contract.usecase';
import { ContractFacade } from 'src/modules/documents/services/contract.facade';
import { ContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';

@Injectable()
export class DeleteContractUsecase implements IUseCaseService<string> {
  private readonly logger = new Logger(DeleteContractUsecase.name);
  constructor(
    private readonly getOneContractUsecase: GetOneContractUsecase,
    private readonly contractFacade: ContractFacade,
    private readonly exceptionsService: ExceptionsService,
    private readonly s3Service: S3Service,
  ) {}

  public async execute(id: string, organizationId: string): Promise<string> {
    // 1. Find the contract
    const contract = await this.getOneContractUsecase.execute({
      id,
      organizationId,
    });

    // 2. check if the contract is approved
    if (contract.status === ContractStatus.APPROVED) {
      this.exceptionsService.badRequestException(
        ContractExceptionMessages.CONTRACT_006,
      );
    }

    try {
      // 3. delete template file
      await this.s3Service.deleteFile(contract.path);

      // 4. Delete the template
      const deleted = await this.contractFacade.delete(contract.id);

      return deleted;
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
