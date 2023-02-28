import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

@Injectable()
export class GetManyVolunteersUseCase
  implements IUseCaseService<Pagination<IVolunteerModel>>
{
  constructor(private readonly volunteerFacade: VolunteerFacade) {}

  public async execute(id: string): Promise<Pagination<IVolunteerModel>> {
    return null;
  }
}
