import { Injectable } from '@nestjs/common';
import { ContractRepositoryService } from '../repositories/contract.repository';
import {
  CreateContractOptions,
  FindManyContractOptions,
  IContractModel,
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
}
