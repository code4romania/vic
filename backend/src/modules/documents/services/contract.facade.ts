import { Injectable } from '@nestjs/common';
import { ContractRepositoryService } from '../repositories/contract.repository';
import {
  CreateContractOptions,
  FindContractOptions,
  FindManyContractOptions,
  IContractModel,
  UpdateContractOptions,
} from '../models/contract.model';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';

@Injectable()
export class ContractFacade {
  constructor(private readonly contractRepository: ContractRepositoryService) {}

  public async create(
    newContract: CreateContractOptions,
  ): Promise<IContractModel> {
    return this.contractRepository.create(newContract);
  }

  public async findMany(
    findOptions: FindManyContractOptions,
  ): Promise<Pagination<IContractModel>> {
    return this.contractRepository.findMany(findOptions);
  }

  public async count(findOptions: FindContractOptions): Promise<number> {
    return this.contractRepository.count(findOptions);
  }

  public async findOne(
    findOptions: FindContractOptions,
  ): Promise<IContractModel> {
    return this.contractRepository.find(findOptions);
  }

  public async updateContract(
    id: string,
    updates: UpdateContractOptions,
  ): Promise<IContractModel> {
    return this.contractRepository.update(id, updates);
  }
}
