import { Injectable } from '@nestjs/common';
import { DocumentContractEntity } from '../entities/document-contract.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { RepositoryWithPagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  CreateDocumentContractOptions,
  DocumentContractStatistics,
  DocumentContractTransformer,
  FindExistingContractForVolunteerInInterval,
  FindOneDocumentContractOptions,
  IDocumentContractModel,
  UpdateDocumentContractOptions,
} from '../models/document-contract.model';
import { DocumentContractStatus } from '../enums/contract-status.enum';

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
  ): Promise<IDocumentContractModel> {
    const documentContract = await this.documentContractRepository.save(
      DocumentContractTransformer.createDocumentContractToEntity(
        newDocumentContract,
      ),
    );

    return DocumentContractTransformer.fromEntity(documentContract);
  }

  async findOne(
    options: FindOneDocumentContractOptions,
  ): Promise<IDocumentContractModel> {
    const documentContract = await this.documentContractRepository.findOne({
      where: options,
    });

    return DocumentContractTransformer.fromEntity(documentContract);
  }

  async findOneForPDFGeneration(id: string): Promise<IDocumentContractModel> {
    const documentContract = await this.documentContractRepository.findOne({
      where: { id },
      relations: {
        organization: true,
        documentTemplate: true,
        volunteerSignature: true,
        legalGuardianSignature: true,
        ngoLegalRepresentativeSignature: true,
      },
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

  async existsByDocumentNumberInSameYear(
    documentNumber: string,
    documentDate: Date,
    organizationId: string,
  ): Promise<boolean> {
    const existingContracts = await this.documentContractRepository
      .createQueryBuilder('contract')
      .where('contract.documentNumber = :documentNumber', {
        documentNumber: documentNumber,
      })
      .andWhere('contract.organizationId = :organizationId', {
        organizationId: organizationId,
      })
      .andWhere('EXTRACT(YEAR FROM contract.documentDate) = :year', {
        year: documentDate.getFullYear(),
      })
      .getMany();

    return existingContracts.length > 0;
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

  async statistics(
    organizationId: string,
  ): Promise<DocumentContractStatistics> {
    const result = await this.documentContractRepository.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE status = $1) AS pending_ngo_representative_signature,
        COUNT(*) FILTER (WHERE status = $2) AS pending_volunteer_signature,
        COUNT(*) FILTER (WHERE CURRENT_DATE BETWEEN document_start_date AND document_end_date) AS active_contracts,
        COUNT(*) FILTER (WHERE document_end_date - CURRENT_DATE <= 30 AND document_end_date - CURRENT_DATE > 0) AS soon_to_expire
      FROM document_contract WHERE organization_id = $3
    `,
      [
        DocumentContractStatus.PENDING_NGO_REPRESENTATIVE_SIGNATURE,
        DocumentContractStatus.PENDING_VOLUNTEER_SIGNATURE,
        organizationId,
      ],
    );

    const data = result[0];

    const statistics = {
      pendingNgoRepresentativeSignature:
        +data.pending_ngo_representative_signature || 0,
      pendingVolunteerSignature: +data.pending_volunteer_signature || 0,
      activeContracts: +data.active_contracts || 0,
      soonToExpire: +data.soon_to_expire || 0,
    };

    return statistics;
  }
}
