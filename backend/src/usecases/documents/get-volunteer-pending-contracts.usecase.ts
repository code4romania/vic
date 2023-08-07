import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import {
  FindManyContractOptions,
  IContractModel,
} from 'src/modules/documents/models/contract.model';
import { ContractFacade } from 'src/modules/documents/services/contract.facade';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

@Injectable()
export class GetVolunteerPendingContractsUsecase
  implements IUseCaseService<Pagination<IContractModel>>
{
  constructor(
    private readonly volunteerFacade: VolunteerFacade,
    private readonly contractFacade: ContractFacade,
    private readonly s3Service: S3Service,
  ) {}

  public async execute(
    findOptions: FindManyContractOptions,
  ): Promise<Pagination<IContractModel>> {
    const volunteer = await this.volunteerFacade.find({
      id: findOptions.volunteerId,
    });

    const contracts = await this.contractFacade.findMany({
      ...findOptions,
      organizationId: volunteer.organization.id,
      pending: true,
    });

    // TODO: review this
    const itemsWithPaths = await Promise.all(
      contracts.items.map(async (contract) => ({
        ...contract,
        path: await this.s3Service.generatePresignedURL(contract.path),
      })),
    );

    return {
      ...contracts,
      items: itemsWithPaths,
    };
  }
}
