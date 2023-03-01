import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessRequestEntity } from './entities/access-request.entity';
import { AccessRequestRepository } from './repositories/access-request.repository';
import { AccessRequestFacade } from './services/access-request.facade';

@Module({
  imports: [TypeOrmModule.forFeature([AccessRequestEntity])],
  providers: [
    // Repositories
    AccessRequestRepository,
    // Facades
    AccessRequestFacade,
  ],
  exports: [
    // Export only facades!
    AccessRequestFacade,
  ],
})
export class AccessRequestModule {}
