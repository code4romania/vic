import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { Repository } from 'typeorm';
import { ContractEntity } from '../entities/contract.entity';
import { IContractRepository } from '../interfaces/contract-repository.interface';
import {
  CreateContractOptions,
  IContractModel,
  FindManyContractOptions,
  ContractTransformer,
  FindContractOptions,
} from '../models/contract.model';

@Injectable()
export class ContractRepositoryService
  extends RepositoryWithPagination<ContractEntity>
  implements IContractRepository
{
  constructor(
    @InjectRepository(ContractEntity)
    private readonly contractRepository: Repository<ContractEntity>,
  ) {
    super(contractRepository);
  }

  async create(newContract: CreateContractOptions): Promise<IContractModel> {
    const contract = await this.contractRepository.save(
      ContractTransformer.toEntity(newContract),
    );

    return this.find({ id: contract.id });
  }

  async findMany(
    findOptions: FindManyContractOptions,
  ): Promise<Pagination<IContractModel>> {
    throw new Error('Method not implemented.');
  }

  async find(findOptions: FindContractOptions): Promise<IContractModel> {
    const contract = await this.contractRepository.findOne({
      where: findOptions,
    });

    return ContractTransformer.fromEntity(contract);
  }
}
