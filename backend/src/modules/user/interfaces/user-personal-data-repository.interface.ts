import {
  CreateUserPersonalDataOptions,
  FindUserPersonalDataOptions,
  IUserPersonalDataModel,
} from '../models/user-personal-data.model';

export interface IUserPersonalDataRepository {
  create(
    userPersonalDataModel: CreateUserPersonalDataOptions,
  ): Promise<IUserPersonalDataModel>;
  update(
    id: string,
    userPersonalDataModel: Partial<CreateUserPersonalDataOptions>,
  ): Promise<IUserPersonalDataModel>;
  find(
    findOptions: FindUserPersonalDataOptions,
  ): Promise<IUserPersonalDataModel>;
}
