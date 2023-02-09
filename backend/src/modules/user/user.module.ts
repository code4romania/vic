import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUserEntity } from './entities/admin-user.entity';
import { UserEntity } from './entities/user.entity';
import { AdminUserRepositoryService } from './repositories/admin-user-repository.service';
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
  providers: [
    UserRepositoryService,
    UserFacadeService,
    AdminUserRepositoryService,
  ],
  exports: [UserFacadeService],
})
export class UserModule {}
