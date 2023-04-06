import { CityEntity } from '../entities/city.entity';
import { ICountyModel } from './county.model';

export interface ICityModel {
  id: number;
  name: string;
  county: ICountyModel;
}

export type FindLocationOptions = {
  search?: string;
  city?: string;
  county?: string;
};

export class CityTransformer {
  static fromEntity(entity: CityEntity): ICityModel {
    return {
      id: entity.id,
      name: entity.name,
      county: entity.county,
    };
  }
}
