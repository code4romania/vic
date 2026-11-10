import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import {
  FindManyContractOptions,
  IContractModel,
} from 'src/modules/documents/models/contract.model';
import { ContractFacade } from 'src/modules/documents/services/contract.facade';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

@Injectable()
export class GetVolunteerContractHistoryUsecase
  implements IUseCaseService<Pagination<IContractModel>>
{
  constructor(
    private readonly volunteerFacade: VolunteerFacade,
    private readonly contractFacade: ContractFacade,
    private readonly s3Service: S3Service,
    private readonly exceptionsService: ExceptionsService,
  ) {}

  public async execute(
    findOptions: FindManyContractOptions,
  ): Promise<Pagination<IContractModel>> {
    // Only a volunteer of this user; never look up { id: undefined } (TypeORM would drop the key
    // and match any volunteer, listing another organization's contracts).
    const volunteer =
      findOptions.volunteerId && findOptions.userId
        ? await this.volunteerFacade.find({
            id: findOptions.volunteerId,
            userId: findOptions.userId,
          })
        : null;

    if (!volunteer) {
      this.exceptionsService.notFoundException(
        VolunteerExceptionMessages.VOLUNTEER_001,
      );
    }

    const contracts = await this.contractFacade.findMany({
      ...findOptions,
      volunteerId: volunteer.id,
      organizationId: volunteer.organization.id,
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
