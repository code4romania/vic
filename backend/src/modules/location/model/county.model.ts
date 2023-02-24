import { CountyEntity } from '../entities/county.entity';

export interface ICountyModel {
  id: number;
  name: string;
  abbreviation: string;
}

export class CountyTransformer {
  static fromEntity(entity: CountyEntity): ICountyModel {
    return {
      id: entity.id,
      name: entity.name,
      abbreviation: entity.abbreviation,
    };
  }
}
