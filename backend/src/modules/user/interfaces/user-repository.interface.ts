import { ArrayOfPropetyType } from 'src/common/helpers/typescript-extends';
import { IFindUserModel, IUserModel } from '../models/user.model';

export interface IUserRepository {
  find(
    options: Partial<IFindUserModel> | ArrayOfPropetyType<IFindUserModel>,
  ): Promise<IUserModel>;
}
