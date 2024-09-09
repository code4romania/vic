import { DocumentSignatureEntity } from '../entities/document-signature.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateSignatureOptions,
  FindOneSignatureOptions,
} from '../models/document-signature.model';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SignatureRepositoryService {
  constructor(
    @InjectRepository(DocumentSignatureEntity)
    private readonly signatureRepository: Repository<DocumentSignatureEntity>,
  ) {}

  async create(
    newSignature: CreateSignatureOptions,
  ): Promise<DocumentSignatureEntity> {
    const signature = await this.signatureRepository.save(newSignature);
    return signature;
  }

  async findOne(
    options: FindOneSignatureOptions,
  ): Promise<DocumentSignatureEntity> {
    const signature = await this.signatureRepository.findOne({
      where: options,
    });
    return signature;
  }
}
