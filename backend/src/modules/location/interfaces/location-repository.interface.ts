import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { FindLocationOptions, ICityModel } from '../model/city.model';
import { ICountyModel } from '../model/county.model';

export interface ILocationRepository {
  findCounties(): Promise<ICountyModel[]>;
  findCities(options: FindLocationOptions): Promise<Pagination<ICityModel>>;
  findCitiesByCountyId(countyId: number): Promise<ICityModel[]>;
}
