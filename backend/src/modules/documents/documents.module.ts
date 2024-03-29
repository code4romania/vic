import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateEntity } from './entities/template.entity';
import { TemplateRepositoryService } from './repositories/template.repository';
import { TemplateFacade } from './services/template.facade';
import { ContractEntity } from './entities/contract.entity';
import { ContractRepositoryService } from './repositories/contract.repository';
import { ContractFacade } from './services/contract.facade';

@Module({
  imports: [TypeOrmModule.forFeature([TemplateEntity, ContractEntity])],
  providers: [
    // Repositories
    TemplateRepositoryService,
    ContractRepositoryService,
    // Facades
    TemplateFacade,
    ContractFacade,
  ],
  exports: [
    // Export only facades!
    TemplateFacade,
    ContractFacade,
  ],
})
export class DocumentsModule {}
