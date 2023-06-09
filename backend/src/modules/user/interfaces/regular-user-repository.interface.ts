import {
  CreateRegularUserOptions,
  FindRegularUserOptions,
  IRegularUserModel,
  UpdateRegularUserOptions,
} from '../models/regular-user.model';

export interface IRegularUserRepository {
  create(userModel: CreateRegularUserOptions): Promise<IRegularUserModel>;
  find(findOptions: FindRegularUserOptions): Promise<IRegularUserModel>;
  update(
    id: string,
    updateUserModel: UpdateRegularUserOptions,
  ): Promise<IRegularUserModel>;
}
