import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUserEntity } from './entities/admin-user.entity';
import { UserEntity } from './entities/user.entity';
import { AdminUserRepositoryService } from './repositories/admin-user-repository.service';
import { UserFacadeService } from './services/user-facade.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, AdminUserEntity])],
  providers: [AdminUserRepositoryService, UserFacadeService],
  exports: [UserFacadeService],
})
export class UserModule {}
