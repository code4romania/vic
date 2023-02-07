import { Module } from '@nestjs/common';
import { ExceptionsModule } from 'src/infrastructure/exceptions/exceptions.module';
import { OngHubModule } from 'src/modules/onghub/onghub.module';
import { OrganizationModule } from 'src/modules/organization/organization.module';
import { UserModule } from 'src/modules/user/user.module';
import { GetOrganizationUseCaseService } from './organization/get-organization-use-case.service';
import { UpdateOrganizationDescriptionUseCaseService } from './organization/update-organization-description-use-case.service';
import { GetUserProfileUseCaseService } from './user/get-user-profile-use-case.service';

@Module({
  imports: [ExceptionsModule, OrganizationModule, OngHubModule, UserModule],
  providers: [
    GetOrganizationUseCaseService,
    UpdateOrganizationDescriptionUseCaseService,
    GetUserProfileUseCaseService,
  ],
  exports: [
    GetOrganizationUseCaseService,
    UpdateOrganizationDescriptionUseCaseService,
    GetUserProfileUseCaseService,
  ],
})
export class UseCaseModule {}
