import {
  CreateUserPersonalDataOptions,
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
}
