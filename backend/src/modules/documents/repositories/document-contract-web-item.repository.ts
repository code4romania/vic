import { Injectable } from '@nestjs/common';
import { DocumentContractWebItemView } from '../entities/document-contract-web-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DocumentContractWebItemTransformer,
  FindOneDocumentContractWebItemOptions,
  IDocumentContractWebItemModel,
} from '../models/document-contract-web-item.model';

@Injectable()
export class DocumentContractWebItemRepository {
  constructor(
    @InjectRepository(DocumentContractWebItemView)
    private readonly documentContractWebItemViewRepository: Repository<DocumentContractWebItemView>,
  ) {}

  async findOne(
    options: FindOneDocumentContractWebItemOptions,
  ): Promise<IDocumentContractWebItemModel> {
    const documentContractWebItemView =
      await this.documentContractWebItemViewRepository.findOne({
        where: {
          documentId: options.documentId,
          organizationId: options.organizationId,
        },
      });
    return DocumentContractWebItemTransformer.fromEntity(
      documentContractWebItemView,
    );
  }
}
