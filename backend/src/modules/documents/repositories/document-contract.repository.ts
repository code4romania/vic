import { Injectable } from '@nestjs/common';
import { DocumentContractEntity } from '../entities/document-contract.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepositoryWithPagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  CreateDocumentContractOptions,
  DocumentContractTransformer,
  FindOneDocumentContractOptions,
  IDocumentContractModel,
  UpdateDocumentContractOptions,
} from '../models/document-contract.model';

@Injectable()
export class DocumentContractRepositoryService extends RepositoryWithPagination<DocumentContractEntity> {
  // TODO: implement IDocumentContractRepository
  constructor(
    @InjectRepository(DocumentContractEntity)
    private readonly documentContractRepository: Repository<DocumentContractEntity>,
  ) {
    super(documentContractRepository);
  }

  async create(
    newDocumentContract: CreateDocumentContractOptions,
  ): Promise<string> {
    const documentContract = await this.documentContractRepository.save(
      DocumentContractTransformer.createDocumentContractToEntity(
        newDocumentContract,
      ),
    );

    return documentContract.id;
  }

  async findOne(
    options: FindOneDocumentContractOptions,
  ): Promise<IDocumentContractModel> {
    const documentContract = await this.documentContractRepository.findOne({
      where: options,
    });

    return DocumentContractTransformer.fromEntity(documentContract);
  }

  async update(
    id: string,
    updates: UpdateDocumentContractOptions,
  ): Promise<IDocumentContractModel> {
    const documentContract = await this.documentContractRepository.preload({
      id,
      ...updates,
    });

    await this.documentContractRepository.save(documentContract);

    return this.findOne({ id });
  }

  async delete(id: string): Promise<string> {
    const documentContract = await this.documentContractRepository.find({
      where: { id },
    });

    if (documentContract) {
      await this.documentContractRepository.remove(documentContract);
      return id;
    }

    return null;
  }
}
