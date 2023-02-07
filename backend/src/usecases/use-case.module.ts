import { Module } from '@nestjs/common';
import { ExceptionsModule } from 'src/infrastructure/exceptions/exceptions.module';
import { OrganizationModule } from 'src/modules/organization/organization.module';
import { CreateAccessCodeUseCase } from './access-code/create-access-code.usecase';
import { DeleteAccessCodeUseCase } from './access-code/delete-access-code.usecase';
import { GetAccessCodeUseCase } from './access-code/get-access-code.usecase';
import { GetAllAccessCodeUseCase } from './access-code/get-all-access-codes.usecase';
import { UpdateAccessCodeUseCase } from './access-code/update-access-code.usecase';
import { GetOrganizationUseCaseService } from './organization/get-organization-use-case.service';
import { UpdateOrganizationDescriptionUseCaseService } from './organization/update-organization-description-use-case.service';

@Module({
  imports: [ExceptionsModule, OrganizationModule],
  providers: [
    GetOrganizationUseCaseService,
    UpdateOrganizationDescriptionUseCaseService,
    CreateAccessCodeUseCase,
    UpdateAccessCodeUseCase,
    GetAccessCodeUseCase,
    GetAllAccessCodeUseCase,
    DeleteAccessCodeUseCase,
  ],
  exports: [
    GetOrganizationUseCaseService,
    UpdateOrganizationDescriptionUseCaseService,
    CreateAccessCodeUseCase,
    UpdateAccessCodeUseCase,
    GetAccessCodeUseCase,
    GetAllAccessCodeUseCase,
    DeleteAccessCodeUseCase,
  ],
})
export class UseCaseModule {}
