import { Injectable } from '@nestjs/common';
import { DocumentContractEntity } from '../entities/document-contract.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { RepositoryWithPagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  CreateDocumentContractOptions,
  DocumentContractTransformer,
  FindExistingContractForVolunteerInInterval,
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

  /**
   * Checks if a contract exists for a volunteer in the given period
   *
   * The method checks if there's any overlap between the new contract period
   * and any existing contract for the volunteer.
   */
  async existsInSamePeriod(
    options: FindExistingContractForVolunteerInInterval,
  ): Promise<boolean> {
    const existingContract = await this.documentContractRepository.exists({
      where: {
        volunteerId: options.volunteerId,
        documentStartDate: LessThanOrEqual(options.documentEndDate),
        documentEndDate: MoreThanOrEqual(options.documentStartDate),
      },
    });

    return !!existingContract;
  }

  async exists(options: FindOneDocumentContractOptions): Promise<boolean> {
    return this.documentContractRepository.exists({ where: options });
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
