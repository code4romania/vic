import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateEntity } from './entities/template.entity';
import { TemplateRepositoryService } from './repositories/template.repository';
import { TemplateFacade } from './services/template.facade';
import { ContractEntity } from './entities/contract.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TemplateEntity, ContractEntity])],
  providers: [
    // Repositories
    TemplateRepositoryService,
    // Facades
    TemplateFacade,
  ],
  exports: [
    // Export only facades!
    TemplateFacade,
  ],
})
export class DocumentsModule {}
