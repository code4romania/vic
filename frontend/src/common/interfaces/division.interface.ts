import { DivisionType } from '../enums/division-type.enum';
import { IUser } from './user.interface';

export interface IDivision {
  id: string;
  name: string;
  type: DivisionType;
  createdBy: IUser;
  numberOfMembers: number;
  createdOn: Date;
}
