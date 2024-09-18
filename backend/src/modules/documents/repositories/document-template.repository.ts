import { RepositoryWithPagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentTemplateEntity } from '../entities/document-template.entity';
import { IDocumentTemplateRepository } from '../interfaces/document-template-repository.interface';
import {
  CreateDocumentTemplateOptions,
  DeleteOneDocumentTemplateOptions,
  DocumentTemplateTransformer,
  FindOneDocumentTemplateOptions,
  IDocumentTemplateModel,
} from '../models/document-template.model';

export class DocumentTemplateRepositoryService
  extends RepositoryWithPagination<DocumentTemplateEntity>
  implements IDocumentTemplateRepository
{
  constructor(
    @InjectRepository(DocumentTemplateEntity)
    private readonly documentTemplateRepository: Repository<DocumentTemplateEntity>,
  ) {
    super(documentTemplateRepository);
  }

  async create(
    newDocumentTemplate: CreateDocumentTemplateOptions,
  ): Promise<IDocumentTemplateModel> {
    const documentTemplate = await this.documentTemplateRepository.save(
      DocumentTemplateTransformer.toEntity(newDocumentTemplate),
    );

    return this.findOne({ id: documentTemplate.id });
  }

  async findOne(
    findOptions: FindOneDocumentTemplateOptions,
  ): Promise<IDocumentTemplateModel> {
    const documentTemplate = await this.documentTemplateRepository.findOne({
      where: findOptions,
      relations: {
        createdByAdmin: true,
      },
    });

    return DocumentTemplateTransformer.fromEntity(documentTemplate);
  }

  async delete(options: DeleteOneDocumentTemplateOptions): Promise<string> {
    const template = await this.documentTemplateRepository.findOneBy(options);

    if (template) {
      await this.documentTemplateRepository.remove(template);
      return options.id;
    }

    return null;
  }
}
