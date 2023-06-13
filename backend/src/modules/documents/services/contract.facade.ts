import { Injectable } from '@nestjs/common';
import { ContractRepositoryService } from '../repositories/contract.repository';
import {
  CreateContractOptions,
  IContractModel,
} from '../models/contract.model';

@Injectable()
export class ContractFacade {
  constructor(private readonly contractRepository: ContractRepositoryService) {}

  public async create(
    newContract: CreateContractOptions,
  ): Promise<IContractModel> {
    return this.contractRepository.create(newContract);
  }
}
