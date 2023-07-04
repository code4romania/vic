import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AdminUserEntity,
  RegularUserEntity,
  UserEntity,
} from './entities/user.entity';
import { AdminUserRepositoryService } from './repositories/admin-user.repository';
import { RegularUserRepositoryService } from './repositories/regular-user.repository';
import { UserFacadeService } from './services/user-facade.service';
import { UserPersonalDataEntity } from './entities/user-personal-data.entity';
import { UserPersonalDataRepository } from './repositories/user-personal-data.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AdminUserEntity,
      RegularUserEntity,
      UserPersonalDataEntity,
    ]),
  ],
  providers: [
    UserFacadeService,
    AdminUserRepositoryService,
    RegularUserRepositoryService,
    UserPersonalDataRepository,
  ],
  exports: [UserFacadeService],
})
export class UserModule {}
