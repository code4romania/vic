import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  FindLocationOptions,
  ICityModel,
} from 'src/modules/location/model/city.model';
import { LocationFacade } from 'src/modules/location/services/location.facade';

@Injectable()
export class GetCitiesUseCase
  implements IUseCaseService<Pagination<ICityModel>>
{
  constructor(private readonly locationFacade: LocationFacade) {}

  public async execute(
    options: FindLocationOptions,
  ): Promise<Pagination<ICityModel>> {
    return this.locationFacade.findCities(options);
  }
}
