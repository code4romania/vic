import { SEX } from '../enums/user.enum';
import { IUserModel } from './base-user.model';

export interface IRegularUserModel extends IUserModel {
  birthday: Date;
  sex: SEX;
  profilePicture: string;
}
