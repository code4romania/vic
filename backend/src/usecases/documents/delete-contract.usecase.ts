import { Injectable, Logger } from '@nestjs/common';
import { JSONStringifyError } from 'src/common/helpers/utils';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { GetOneContractUsecase } from './get-one-contract.usecase';
import { ContractFacade } from 'src/modules/documents/services/contract.facade';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { assertVolunteerAcceptsDocuments } from 'src/modules/volunteer/volunteer-status.rules';

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
    // An inactive or blocked volunteer's contracts are read-only
    assertVolunteerAcceptsDocuments(contract.volunteer);

    // #486: the NGO uploaded it, so it can also remove a wrong upload, signed or not
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
