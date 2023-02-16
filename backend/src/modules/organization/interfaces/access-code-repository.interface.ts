import { IRepositoryWithPagination } from 'src/common/interfaces/repository-with-pagination.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { AccessCodeEntity } from '../entities/access-code.entity';
import {
  IAccessCodeModel,
  ICreateAccessCodeModel,
  IFindAccessCodeModel,
  IFindAllAccessCodeModel,
  IUpdateAccessCodeModel,
} from '../models/access-code.model';

export interface IAccessCodeRepository
  extends IRepositoryWithPagination<AccessCodeEntity> {
  create(newAccessCode: ICreateAccessCodeModel): Promise<IAccessCodeModel>;
  update(updateAccessCode: IUpdateAccessCodeModel): Promise<IAccessCodeModel>;
  find(findOptions: IFindAccessCodeModel): Promise<IAccessCodeModel>;
  findMany(
    findOptions: IFindAllAccessCodeModel,
  ): Promise<Pagination<IAccessCodeModel>>;
  delete(id: string): Promise<IAccessCodeModel>;
}
