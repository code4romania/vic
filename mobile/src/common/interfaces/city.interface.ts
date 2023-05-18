import { ICounty } from './county.interface';

export interface ICity {
  id: number;
  name: string;
  county: ICounty;
}
