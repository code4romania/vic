import { Module } from '@nestjs/common';
import { ExceptionsModule } from 'src/infrastructure/exceptions/exceptions.module';
import { OrganizationModule } from 'src/modules/organization/organization.module';
import { GetOrganizationUseCaseService } from './organization/get-organization-use-case.service';
import { UpdateOrganizationDescriptionUseCaseService } from './organization/update-organization-description-use-case.service';

@Module({
  imports: [ExceptionsModule, OrganizationModule],
  providers: [
    GetOrganizationUseCaseService,
    UpdateOrganizationDescriptionUseCaseService,
  ],
  exports: [
    GetOrganizationUseCaseService,
    UpdateOrganizationDescriptionUseCaseService,
  ],
})
export class UseCaseModule {}
