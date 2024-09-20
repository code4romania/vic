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
import { DocumentContractEntity } from './entities/document-contract.entity';
import { DocumentContractRepositoryService } from './repositories/document-contract.repository';
import { DocumentContractFacade } from './services/document-contract.facade';
import { DocumentContractListViewEntity } from './entities/document-contract-list-view.entity';
import { DocumentContractListViewRepository } from './repositories/document-contract-list-view.repository';
import { DocumentSignatureEntity } from './entities/document-signature.entity';
import { DocumentTemplateListViewEntity } from './entities/document-template-list-view.entity';
import { DocumentTemplateListViewRepository } from './repositories/document-template-list-view.repository';
import { DocumentSignatureRepository } from './repositories/document-signature.repository';
import { DocumentSignatureFacade } from './services/document-signature.facade';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentContractListViewEntity,
      DocumentTemplateListViewEntity,
      TemplateEntity,
      ContractEntity,
      DocumentTemplateEntity,
      DocumentContractEntity,
      DocumentSignatureEntity,
    ]),
  ],
  providers: [
    // Repositories
    TemplateRepositoryService,
    ContractRepositoryService,
    DocumentTemplateRepositoryService,
    DocumentContractRepositoryService,
    DocumentSignatureRepository,
    DocumentContractListViewRepository,
    DocumentTemplateListViewRepository,
    // Facades
    TemplateFacade,
    ContractFacade,
    DocumentTemplateFacade,
    DocumentContractFacade,
    DocumentSignatureFacade,
    // Services
    PDFGenerator,
  ],
  exports: [
    // Export only facades!
    TemplateFacade,
    ContractFacade,
    PDFGenerator,
    DocumentTemplateFacade,
    DocumentContractFacade,
    DocumentSignatureFacade,
  ],
})
export class DocumentsModule {}
