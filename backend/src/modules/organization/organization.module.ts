import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessCodeEntity } from './entities/access-code.entity';
import { OrganizationStructureEntity } from './entities/organization-structure.entity';
import { OrganizationEntity } from './entities/organization.entity';
import { AccessCodeRepositoryService } from './repositories/access-code.repository';
import { OrganizationRepositoryService } from './repositories/organization.repository';
import { OrganizationStructureRepositoryService } from './repositories/organization-structure.repository';
import { AccessCodeFacade } from './services/access-code.facade';
import { OrganizationStructureFacade } from './services/organization-structure.facade';
import { OrganizationFacadeService } from './services/organization.facade';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrganizationEntity,
      AccessCodeEntity,
      OrganizationStructureEntity,
    ]),
  ],
  providers: [
    // Repositories
    OrganizationRepositoryService,
    AccessCodeRepositoryService,
    OrganizationStructureRepositoryService,

    // Facades
    OrganizationFacadeService,
    AccessCodeFacade,
    OrganizationStructureFacade,
  ],
  exports: [
    // Export only facades!
    OrganizationFacadeService,
    AccessCodeFacade,
    OrganizationStructureFacade,
  ],
})
export class OrganizationModule {}
