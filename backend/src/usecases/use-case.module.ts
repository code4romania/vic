import { Module } from '@nestjs/common';
import { ExceptionsModule } from 'src/infrastructure/exceptions/exceptions.module';
import { AccessRequestModule } from 'src/modules/access-request/access-request.module';
import { OngHubModule } from 'src/modules/onghub/onghub.module';
import { OrganizationModule } from 'src/modules/organization/organization.module';
import { UserModule } from 'src/modules/user/user.module';
import { CreateAccessCodeUseCase } from './access-code/create-access-code.usecase';
import { DeleteAccessCodeUseCase } from './access-code/delete-access-code.usecase';
import { GetAccessCodeUseCase } from './access-code/get-access-code.usecase';
import { GetAllAccessCodeUseCase } from './access-code/get-all-access-codes.usecase';
import { UpdateAccessCodeUseCase } from './access-code/update-access-code.usecase';
import { CreateAccessRequestUseCase } from './access-request/create-access-request.usecase';
import { DeleteAccessRequestUseCase } from './access-request/delete-access-request.usecase';
import { GetAccessRequestUseCase } from './access-request/get-access-request.usecase';
import { GetOrganizationUseCaseService } from './organization/get-organization.usecase';
import { CreateOrganizationStructureUseCase } from './organization/organization-structure/create-organization-structure.usecase';
import { DeleteOrganizationStructureUseCase } from './organization/organization-structure/delete-organization-structure.usecase';
import { GetAllOrganizationStructureUseCase } from './organization/organization-structure/get-all-organization-structure.usecase';
import { UpdateOrganizationStructureUseCase } from './organization/organization-structure/update-organization-structure.usecase';
import { UpdateOrganizationDescriptionUseCaseService } from './organization/update-organization-description.usecase';
import { GetUserProfileUseCaseService } from './user/get-user-profile.usecase';

@Module({
  imports: [
    ExceptionsModule,
    OrganizationModule,
    OngHubModule,
    UserModule,
    AccessRequestModule,
  ],
  providers: [
    // Organization
    GetOrganizationUseCaseService,
    UpdateOrganizationDescriptionUseCaseService,
    // Access Codes
    CreateAccessCodeUseCase,
    UpdateAccessCodeUseCase,
    GetAccessCodeUseCase,
    GetAllAccessCodeUseCase,
    DeleteAccessCodeUseCase,
    // Organization structure
    CreateOrganizationStructureUseCase,
    GetAllOrganizationStructureUseCase,
    DeleteOrganizationStructureUseCase,
    UpdateOrganizationStructureUseCase,
    // User
    GetUserProfileUseCaseService,
    // Access Requests
    CreateAccessRequestUseCase,
    GetAccessRequestUseCase,
    DeleteAccessRequestUseCase,
  ],
  exports: [
    // Organization
    GetOrganizationUseCaseService,
    UpdateOrganizationDescriptionUseCaseService,
    // Access Codes
    CreateAccessCodeUseCase,
    UpdateAccessCodeUseCase,
    GetAccessCodeUseCase,
    GetAllAccessCodeUseCase,
    DeleteAccessCodeUseCase,
    // Organization Structure
    CreateOrganizationStructureUseCase,
    GetAllOrganizationStructureUseCase,
    DeleteOrganizationStructureUseCase,
    UpdateOrganizationStructureUseCase,
    // user
    GetUserProfileUseCaseService,
    // Access Requests
    CreateAccessRequestUseCase,
    GetAccessRequestUseCase,
    DeleteAccessRequestUseCase,
  ],
})
export class UseCaseModule {}
