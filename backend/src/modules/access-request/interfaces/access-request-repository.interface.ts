import { IAccessRequestDownload } from 'src/common/interfaces/access-request-download.interface';
import { IRepositoryWithPagination } from 'src/common/interfaces/repository-with-pagination.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { AccessRequestEntity } from '../entities/access-request.entity';
import {
  CreateAccessRequestModel,
  FindAccessRequestOptions,
  FindManyAccessRequestsOptions,
  IAccessRequestModel,
  UpdateAccessRequestModel,
} from '../model/access-request.model';

export interface IAccessRequestRepository
  extends IRepositoryWithPagination<AccessRequestEntity> {
  create(newRequest: CreateAccessRequestModel): Promise<IAccessRequestModel>;
  update(updates: UpdateAccessRequestModel): Promise<IAccessRequestModel>;
  find(findOptions: FindAccessRequestOptions): Promise<IAccessRequestModel>;
  findMany(
    findOptions: FindManyAccessRequestsOptions,
  ): Promise<Pagination<IAccessRequestModel>>;
  delete(id: string): Promise<string>;
  getManyForDownload(
    findOptions: FindAccessRequestOptions,
  ): Promise<IAccessRequestDownload[]>;
}
