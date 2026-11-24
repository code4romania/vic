import { Injectable } from '@nestjs/common';
import { contentTypeFor, IStoredFile } from 'src/common/helpers/file-response';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { FindContractOptions } from 'src/modules/documents/models/contract.model';
import { ContractFacade } from 'src/modules/documents/services/contract.facade';

// #724: the signed PDF itself, streamed through the API for the in-app viewer and the Download
// button. Web callers pass the admin's organizationId; the mobile route is guarded by
// ContractVolunteerGuard and passes only the id.
@Injectable()
export class GetContractFileUsecase {
  constructor(
    private readonly contractFacade: ContractFacade,
    private readonly exceptionsService: ExceptionsService,
    private readonly s3Service: S3Service,
  ) {}

  public async execute(
    findOptions: Pick<FindContractOptions, 'id' | 'organizationId'>,
    { requireOrganization }: { requireOrganization: boolean },
  ): Promise<IStoredFile> {
    // TypeORM drops undefined keys: without this, an admin with no organization would match any
    if (requireOrganization && !findOptions.organizationId) {
      this.exceptionsService.notFoundException(
        ContractExceptionMessages.CONTRACT_002,
      );
    }

    const contract = await this.contractFacade.findOne(findOptions);
    if (!contract) {
      this.exceptionsService.notFoundException(
        ContractExceptionMessages.CONTRACT_002,
      );
    }

    const file = await this.s3Service.getFile(contract.path);
    if (!file) {
      this.exceptionsService.notFoundException(
        ContractExceptionMessages.CONTRACT_010,
      );
    }

    return {
      ...file,
      fileName: contract.fileName,
      contentType: contentTypeFor(contract.path),
    };
  }
}
