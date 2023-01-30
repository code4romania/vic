import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserRepositoryService } from './repositories/user-repository.service';
import { UserFacadeService } from './services/user-facade.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UserRepositoryService, UserFacadeService],
  exports: [UserFacadeService],
})
export class UserModule {}
