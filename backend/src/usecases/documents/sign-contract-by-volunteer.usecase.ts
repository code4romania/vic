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

@Injectable()
export class SignContractByVolunteer
  implements IUseCaseService<IContractModel>
{
  private readonly logger = new Logger(SignContractByVolunteer.name);

  constructor(
    private readonly contractFacade: ContractFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly s3Service: S3Service,
  ) {}

  public async execute(
    contractId: string,
    organizationId: string,
    files: Express.Multer.File[],
  ): Promise<IContractModel> {
    // 1. check if contract exists
    const contract = await this.contractFacade.findOne({
      id: contractId,
      organizationId,
      status: ContractStatus.PENDING_VOLUNTEER,
    });

    if (!contract)
      this.exceptionService.notFoundException(
        ContractExceptionMessages.CONTRACT_002,
      );

    // 2. updaload new contract file to s3 and get the path
    try {
      // 1. upload file to s3 and get the path
      const path = await this.s3Service.uploadFile(
        `${S3_FILE_PATHS.CONTRACTS}/${organizationId}`,
        files[0],
      );

      // 3. update the contract path and status from datatbase and get the updates
      const newContract = await this.contractFacade.updateContract(contractId, {
        path,
        status: ContractStatus.PENDING_ADMIN,
      });

      // 4 Check if the contract had its template deleted
      if (!contract.templateId) {
        // if there are not other contracts with deleted tempalate delete the file.
        const pendingVolunteerContract = await this.contractFacade.findOne({
          status: ContractStatus.PENDING_VOLUNTEER,
          templateId: null,
          organizationId,
        });

        if (!pendingVolunteerContract) {
          await this.s3Service.deleteFile(contract.path);
        }
      }

      // 5. generate contract
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
