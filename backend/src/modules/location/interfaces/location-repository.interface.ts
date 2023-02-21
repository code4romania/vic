import { ICityModel } from '../model/city.model';
import { ICountyModel } from '../model/county.model';

export interface ILocationRepository {
  findCounties(): Promise<ICountyModel[]>;
  findCities(searchWord: string): Promise<ICityModel[]>;
}
