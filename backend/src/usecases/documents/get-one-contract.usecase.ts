import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import {
  FindContractOptions,
  IContractModel,
} from 'src/modules/documents/models/contract.model';
import { ContractFacade } from 'src/modules/documents/services/contract.facade';

@Injectable()
export class GetOneContractUsecase implements IUseCaseService<IContractModel> {
  constructor(
    private readonly contractFacade: ContractFacade,
    private readonly exceptionsService: ExceptionsService,
    private readonly s3Service: S3Service,
  ) {}

  public async execute(
    findOptions: FindContractOptions,
  ): Promise<IContractModel> {
    const contract = await this.contractFacade.findOne(findOptions);

    if (!contract)
      this.exceptionsService.notFoundException(
        ContractExceptionMessages.CONTRACT_002,
      );

    return {
      ...contract,
      path: await this.s3Service.generatePresignedURL(contract.path),
    };
  }
}
