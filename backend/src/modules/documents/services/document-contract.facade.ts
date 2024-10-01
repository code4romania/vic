import { Injectable } from '@nestjs/common';
import { DocumentContractRepositoryService } from '../repositories/document-contract.repository';
import {
  CreateDocumentContractOptions,
  IDocumentContractModel,
  FindOneDocumentContractOptions,
  UpdateDocumentContractOptions,
  FindExistingContractForVolunteerInInterval,
  DocumentContractStatistics,
} from '../models/document-contract.model';
import { DocumentContractListViewRepository } from '../repositories/document-contract-list-view.repository';
import {
  FindManyDocumentContractListViewPaginatedOptions,
  IDocumentContractListViewModel,
} from '../models/document-contract-list-view.model';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { DocumentContractStatus } from '../enums/contract-status.enum';
import {
  FindOneDocumentContractItemOptions,
  IDocumentContractItemModel,
} from '../models/document-contract-item-view.model';
import { DocumentContractItemRepository } from '../repositories/document-contract-item-view.repository';

@Injectable()
export class DocumentContractFacade {
  constructor(
    private readonly documentContractRepository: DocumentContractRepositoryService,
    private readonly documentContractListViewRepository: DocumentContractListViewRepository,
    private readonly documentContractWebItemRepository: DocumentContractItemRepository,
  ) {}

  async approveDocumentContractByNGO(
    documentContractId: string,
  ): Promise<IDocumentContractModel> {
    return this.documentContractRepository.update(documentContractId, {
      status: DocumentContractStatus.PENDING_NGO_REPRESENTATIVE_SIGNATURE,
    });
  }

  async signDocumentContractByNGO(
    documentContractId: string,
    signatureId: string,
  ): Promise<IDocumentContractModel> {
    return this.documentContractRepository.update(documentContractId, {
      status: DocumentContractStatus.APPROVED,
      ngoLegalRepresentativeSignatureId: signatureId,
    });
  }

  async rejectDocumentContractByNGO(
    documentContractId: string,
    rejectionReason: string,
    rejectedById: string,
  ): Promise<IDocumentContractModel> {
    return this.documentContractRepository.update(documentContractId, {
      status: DocumentContractStatus.REJECTED_NGO,
      rejectionReason,
      rejectedById,
      rejectionDate: new Date(),
    });
  }

  async rejectDocumentContractByVolunteer(
    documentContractId: string,
    rejectionReason: string,
    userId: string,
  ): Promise<IDocumentContractModel> {
    return this.documentContractRepository.update(documentContractId, {
      status: DocumentContractStatus.REJECTED_VOLUNTEER,
      rejectionReason,
      rejectedById: userId,
      rejectionDate: new Date(),
    });
  }

  async create(
    newDocumentContract: CreateDocumentContractOptions,
  ): Promise<IDocumentContractModel> {
    return this.documentContractRepository.create(newDocumentContract);
  }

  async findOne(
    options: FindOneDocumentContractOptions,
  ): Promise<IDocumentContractModel> {
    return this.documentContractRepository.findOne(options);
  }

  async findOneItem(
    options: FindOneDocumentContractItemOptions,
  ): Promise<IDocumentContractItemModel> {
    return this.documentContractWebItemRepository.findOne(options);
  }

  async exists(options: FindOneDocumentContractOptions): Promise<boolean> {
    return this.documentContractRepository.exists(options);
  }

  async existsInSamePeriod(
    options: FindExistingContractForVolunteerInInterval,
  ): Promise<boolean> {
    return this.documentContractRepository.existsInSamePeriod(options);
  }

  async existsByDocumentNumberInSameYear(
    documentNumber: string,
    documentDate: Date,
    organizationId: string,
  ): Promise<boolean> {
    return this.documentContractRepository.existsByDocumentNumberInSameYear(
      documentNumber,
      documentDate,
      organizationId,
    );
  }

  async findManyPaginated(
    options: FindManyDocumentContractListViewPaginatedOptions,
  ): Promise<Pagination<IDocumentContractListViewModel>> {
    return this.documentContractListViewRepository.findManyPaginated(options);
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

  async statistics(
    organizationId: string,
  ): Promise<DocumentContractStatistics> {
    return this.documentContractRepository.statistics(organizationId);
  }
}
