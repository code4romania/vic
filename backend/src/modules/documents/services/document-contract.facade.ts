import { Injectable } from '@nestjs/common';
import { DocumentContractRepositoryService } from '../repositories/document-contract.repository';
import {
  CreateDocumentContractOptions,
  IDocumentContractModel,
  FindOneDocumentContractOptions,
  UpdateDocumentContractOptions,
} from '../models/document-contract.model';
import { DocumentContractListViewRepository } from '../repositories/document-contract-list-view.repository';
import {
  FindManyDocumentContractListViewOptions,
  IDocumentContractListViewModel,
} from '../models/document-contract-list-view.model';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';

@Injectable()
export class DocumentContractFacade {
  constructor(
    private readonly documentContractRepository: DocumentContractRepositoryService,
    private readonly documentContractListViewRepository: DocumentContractListViewRepository,
  ) {}

  async create(
    newDocumentContract: CreateDocumentContractOptions,
  ): Promise<string> {
    return this.documentContractRepository.create(newDocumentContract);
  }

  async findOne(
    options: FindOneDocumentContractOptions,
  ): Promise<IDocumentContractModel> {
    return this.documentContractRepository.findOne(options);
  }

  async exists(options: FindOneDocumentContractOptions): Promise<boolean> {
    return this.documentContractRepository.exists(options);
  }

  async findMany(
    options: FindManyDocumentContractListViewOptions,
  ): Promise<Pagination<IDocumentContractListViewModel>> {
    return this.documentContractListViewRepository.findMany(options);
  }

  async update(
    id: string,
    updates: UpdateDocumentContractOptions,
  ): Promise<IDocumentContractModel> {
    return this.documentContractRepository.update(id, updates);
  }

  async delete(id: string): Promise<string> {
    return this.documentContractRepository.delete(id);
  }
}
