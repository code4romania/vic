import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import { CityEntity } from '../entities/city.entity';
import { ICountyModel } from './county.model';

export interface ICityModel {
  id: number;
  name: string;
  county: ICountyModel;
}

export type FindLocationOptions = {
  search?: string;
  countyId?: number;
} & IBasePaginationFilterModel;

export class CityTransformer {
  static fromEntity(entity: CityEntity): ICityModel {
    return {
      id: entity.id,
      name: entity.name,
      county: entity.county,
    };
  }
}
