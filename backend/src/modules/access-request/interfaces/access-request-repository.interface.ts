import {
  CreateAccessRequestModel,
  FindAccessRequestOptions,
  FindManyAccessRequestsOptions,
  IAccessRequestModel,
  UpdateAccessRequestModel,
} from '../model/access-request.model';

export interface IAccessRequestRepository {
  create(newRequest: CreateAccessRequestModel): Promise<IAccessRequestModel>;
  update(updates: UpdateAccessRequestModel): Promise<IAccessRequestModel>;
  find(findOptions: FindAccessRequestOptions): Promise<IAccessRequestModel>;
  findAll(
    findOptions: FindManyAccessRequestsOptions,
  ): Promise<IAccessRequestModel[]>;
  delete(id: string): Promise<string>;
}
