import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionsArchiveEntity } from './entities/actions-archive.entity';
import { OrganizationProfileListener } from './modules/organization-profile/organization-profile.listener';
import { OrganizationStructureListener } from './modules/organization-structure/organization-structure.listener';
import { ActionsArchiveFacade } from './organization-structure.facade';

@Module({
  imports: [TypeOrmModule.forFeature([ActionsArchiveEntity])],
  providers: [
    // Listeners
    OrganizationStructureListener,
    OrganizationProfileListener,

    // Facade
    ActionsArchiveFacade,
  ],
  exports: [ActionsArchiveFacade],
})
export class ActionsArchiveModule {}
