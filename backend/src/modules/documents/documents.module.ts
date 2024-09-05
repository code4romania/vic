import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateEntity } from './entities/template.entity';
import { TemplateRepositoryService } from './repositories/template.repository';
import { TemplateFacade } from './services/template.facade';
import { ContractEntity } from './entities/contract.entity';
import { ContractRepositoryService } from './repositories/contract.repository';
import { ContractFacade } from './services/contract.facade';
import { PDFGenerator } from './services/pdf-generator';
import { DocumentTemplateRepositoryService } from './repositories/document-template.repository';
import { DocumentTemplateFacade } from './services/document-template.facade';
import { DocumentTemplateEntity } from './entities/document-template.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TemplateEntity,
      ContractEntity,
      DocumentTemplateEntity,
    ]),
  ],
  providers: [
    // Repositories
    TemplateRepositoryService,
    ContractRepositoryService,
    DocumentTemplateRepositoryService,
    // Facades
    TemplateFacade,
    ContractFacade,
    DocumentTemplateFacade,
    // Services
    PDFGenerator,
  ],
  exports: [
    // Export only facades!
    TemplateFacade,
    ContractFacade,
    PDFGenerator,
    DocumentTemplateFacade,
  ],
})
export class DocumentsModule {}
