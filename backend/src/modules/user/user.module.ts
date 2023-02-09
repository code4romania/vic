import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUserEntity } from './entities/admin-user.entity';
import { UserEntity } from './entities/user.entity';
import { VolunteerUserEntity } from './entities/volunteer-user.entity';
import { UserRepositoryService } from './repositories/user-repository.service';
import { UserFacadeService } from './services/user-facade.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AdminUserEntity,
      VolunteerUserEntity,
    ]),
  ],
  providers: [UserRepositoryService, UserFacadeService],
  exports: [UserFacadeService],
})
export class UserModule {}
