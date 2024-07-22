import { Injectable } from '@nestjs/common';
import { FindLocationOptions, ICityModel } from '../model/city.model';
import { ICountyModel } from '../model/county.model';
import { LocationRepositoryService } from '../repositories/location.repository';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';

@Injectable()
export class LocationFacade {
  constructor(private readonly locationRepository: LocationRepositoryService) {}

  public async findCities(
    options: FindLocationOptions,
  ): Promise<Pagination<ICityModel>> {
    return this.locationRepository.findCities(options);
  }

  public async findCitiesByCountyId(countyId: number): Promise<ICityModel[]> {
    return this.locationRepository.findCitiesByCountyId(countyId);
  }

  public async findCounties(): Promise<ICountyModel[]> {
    return this.locationRepository.findCounties();
  }
}
