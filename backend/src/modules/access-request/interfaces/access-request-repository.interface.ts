import {
  CreateAccessRequestModel,
  FindAccessRequestModel,
  IAccessRequestModel,
  UpdateAccessRequestModel,
} from '../model/access-request.model';

export interface IAccessRequestRepository {
  create(newRequest: CreateAccessRequestModel): Promise<IAccessRequestModel>;
  update(updates: UpdateAccessRequestModel): Promise<IAccessRequestModel>;
  find(findOptions: FindAccessRequestModel): Promise<IAccessRequestModel>;
  findAll(findOptions: unknown): Promise<IAccessRequestModel[]>;
  delete(id: string): Promise<IAccessRequestModel>;
}
