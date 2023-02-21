import { Injectable } from '@nestjs/common';
import { ICityModel } from '../model/city.model';
import { ICountyModel } from '../model/county.model';
import { LocationRepositoryService } from '../repositories/location.repository';

@Injectable()
export class LocationFacade {
  constructor(private readonly locationRepository: LocationRepositoryService) {}

  public async findCities(): Promise<ICityModel[]> {
    return this.locationRepository.findCities();
  }

  public async findCounties(): Promise<ICountyModel[]> {
    return this.locationRepository.findCounties();
  }
}
