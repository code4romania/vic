import { Injectable } from '@nestjs/common';
import { DocumentContractItemView } from '../entities/document-contract-web-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DocumentContractItemTransformer,
  FindOneDocumentContractItemOptions,
  IDocumentContractItemModel,
} from '../models/document-contract-item-view.model';

@Injectable()
export class DocumentContractItemRepository {
  constructor(
    @InjectRepository(DocumentContractItemView)
    private readonly documentContractItemViewRepository: Repository<DocumentContractItemView>,
  ) {}

  async findOne(
    options: FindOneDocumentContractItemOptions,
  ): Promise<IDocumentContractItemModel> {
    const documentContractWebItemView =
      await this.documentContractItemViewRepository.findOne({
        where: {
          ...options,
        },
      });
    return DocumentContractItemTransformer.fromEntity(
      documentContractWebItemView,
    );
  }
}
