import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessCodeEntity } from './entities/access-code.entity';
import { OrganizationEntity } from './entities/organization.entity';
import { AccessCodeRepositoryService } from './repositories/access-code.repository';
import { OrganizationRepositoryService } from './repositories/organization-repository.service';
import { AccessCodeFacade } from './services/access-code.facade';
import { OrganizationFacadeService } from './services/organization.facade';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationEntity, AccessCodeEntity])],
  providers: [
    OrganizationRepositoryService,
    OrganizationFacadeService,
    AccessCodeRepositoryService,
    AccessCodeFacade,
  ],
  exports: [OrganizationFacadeService, AccessCodeFacade],
})
export class OrganizationModule {}
