import { IRepositoryWithPagination } from 'src/common/interfaces/repository-with-pagination.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { ContractEntity } from '../entities/contract.entity';
import {
  CreateContractOptions,
  FindContractOptions,
  FindManyContractOptions,
  IContractModel,
} from '../models/contract.model';

export interface IContractRepository
  extends IRepositoryWithPagination<ContractEntity> {
  create(newContract: CreateContractOptions): Promise<IContractModel>;
  findMany(
    findOptions: FindManyContractOptions,
  ): Promise<Pagination<IContractModel>>;
  find(findOptions: FindContractOptions): Promise<IContractModel>;
  count(findOptions: FindContractOptions): Promise<number>;
}
