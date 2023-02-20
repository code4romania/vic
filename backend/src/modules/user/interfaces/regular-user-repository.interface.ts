import {
  CreateRegularUserOptions,
  FindRegularUserOptions,
  IRegularUserModel,
} from '../models/regular-user.model';

export interface IRegularUserRepository {
  create(userModel: CreateRegularUserOptions): Promise<IRegularUserModel>;
  find(findOptions: FindRegularUserOptions): Promise<IRegularUserModel>;
}
