import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { IDocumentContractListViewModel } from 'src/modules/documents/models/document-contract-list-view.model';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

@Injectable()
export class GetManyDocumentContractsByVolunteerUsecase
  implements IUseCaseService<Pagination<IDocumentContractListViewModel>>
{
  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly volunteerFacade: VolunteerFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute({
    userId,
    organizationId,
    ...paginationOptions
  }: {
    userId: string;
    organizationId: string;
  } & IBasePaginationFilterModel): Promise<
    Pagination<IDocumentContractListViewModel>
  > {
    // 1. Find the volunteerId based on userId and organizationId
    const volunteer = await this.volunteerFacade.find({
      userId: userId,
      organizationId,
    });

    if (!volunteer) {
      this.exceptionService.notFoundException(
        VolunteerExceptionMessages.VOLUNTEER_001,
      );
    }

    // 2. Find the document contracts based on the volunteerId
    return this.documentContractFacade.findMany({
      ...paginationOptions,
      organizationId,
      volunteerId: volunteer.id,
    });
  }
}
