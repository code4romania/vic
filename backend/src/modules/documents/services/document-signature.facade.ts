import { Injectable } from '@nestjs/common';
import { DocumentSignatureRepository } from '../repositories/document-signature.repository';
import { CreateSignatureOptions } from '../models/document-signature.model';

@Injectable()
export class DocumentSignatureFacade {
  constructor(
    private readonly documentSignatureRepository: DocumentSignatureRepository,
  ) {}

  async create(newSignature: CreateSignatureOptions): Promise<string> {
    return this.documentSignatureRepository.create(newSignature);
  }

  async delete(id: string): Promise<void> {
    return this.documentSignatureRepository.delete(id);
  }
}
