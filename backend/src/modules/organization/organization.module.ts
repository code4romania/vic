import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationEntity } from './entities/organization.entity';
import { OrganizationRepositoryService } from './repositories/organization-repository.service';
import { OrganizationFacadeService } from './services/organization-facade.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationEntity])],
  providers: [OrganizationRepositoryService, OrganizationFacadeService],
  exports: [OrganizationFacadeService],
})
export class OrganizationModule {}
