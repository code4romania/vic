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
import { ApproveAccessRequestUseCase } from './access-request/approve-access-request.usecase';
import { RejectAccessRequestUseCase } from './access-request/reject-access-request.usecase';
import { GetManyNewAccessRequestsUseCase } from './access-request/get-many-new-access-requests.usecase';
import { GetManyRejectedAccessRequestsUseCase } from './access-request/get-many-rejected-access-requests.usecase';
import { CreateRegularUsereUseCaseService } from './user/create-regular-user.usecase';
import { GetOneOrganizationStructureUseCase } from './organization/organization-structure/get-one-organization-structure.usecase';
import { LocationModule } from 'src/modules/location/location.module';
import { GetCitiesUseCase } from './location/get-citties.usecase';
import { GetCountiesUseCase } from './location/get-counties.usecase';
import { ActivityTypeModule } from 'src/modules/activity-type/activity-type.module';
import { CreateActivityTypeUseCase } from './activity-type/create-activity-type.usecase';
import { UpdateActivityTypeUseCase } from './activity-type/update-activity-type.usecase';
import { ActivateActivityTypeUseCase } from './activity-type/activate-activity-type.usecase';
import { ArchiveActivityTypeUseCase } from './activity-type/archive-activity-type.usecase';
import { GetOneActivityTypeUseCase } from './activity-type/get-one-activity-type.usecase';
import { GetManyActivityTypeUseCase } from './activity-type/get-all-activity-type.usecase';
import { GetAllOrganizationStructureByTypeUseCase } from './organization/organization-structure/get-all-organization-structure-by-type.usecase';
import { VolunteerModule } from 'src/modules/volunteer/volunteer.module';
import { GetOneRegularUserUseCaseService } from './user/get-one-regular-user.usecase';
import { CreateVolunteerUseCase } from './volunteer/create-volunteer.usecase';
import { GetOneVolunteerUsecase } from './volunteer/get-one-volunteer.usecase';
import { CreateVolunteerProfileUseCase } from './volunteer/create-volunteer-profile.usecase';
import { GetManyVolunteersUseCase } from './volunteer/get-many-volunteers.usecase';
import { ArchiveVolunteerUsecase } from './volunteer/archive-volunteer.usescase';
import { BlockVolunteerUsecase } from './volunteer/block-volunteer.usecase';
import { ActivateVolunteerUsecase } from './volunteer/activate-volunteer.usecase';
import { UpdateVolunteerProfileUsecase } from './volunteer/update-volunteer-profile.usecase';

@Module({
  imports: [
    ExceptionsModule,
    OrganizationModule,
    OngHubModule,
    UserModule,
    AccessRequestModule,
    LocationModule,
    ActivityTypeModule,
    VolunteerModule,
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
    GetOneOrganizationStructureUseCase,
    DeleteOrganizationStructureUseCase,
    UpdateOrganizationStructureUseCase,
    GetAllOrganizationStructureByTypeUseCase,
    // User
    GetUserProfileUseCaseService,
    CreateRegularUsereUseCaseService,
    GetOneRegularUserUseCaseService,
    // Access Requests
    GetManyNewAccessRequestsUseCase,
    GetManyRejectedAccessRequestsUseCase,
    CreateAccessRequestUseCase,
    GetAccessRequestUseCase,
    DeleteAccessRequestUseCase,
    ApproveAccessRequestUseCase,
    RejectAccessRequestUseCase,
    // Location
    GetCitiesUseCase,
    GetCountiesUseCase,
    // Activity Types
    CreateActivityTypeUseCase,
    UpdateActivityTypeUseCase,
    ActivateActivityTypeUseCase,
    ArchiveActivityTypeUseCase,
    GetOneActivityTypeUseCase,
    GetManyActivityTypeUseCase,
    // Volunteers
    GetOneVolunteerUsecase,
    CreateVolunteerUseCase,
    ArchiveVolunteerUsecase,
    BlockVolunteerUsecase,
    ActivateVolunteerUsecase,
    CreateVolunteerProfileUseCase,
    GetManyVolunteersUseCase,
    UpdateVolunteerProfileUsecase,
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
    GetOneOrganizationStructureUseCase,
    DeleteOrganizationStructureUseCase,
    UpdateOrganizationStructureUseCase,
    GetAllOrganizationStructureByTypeUseCase,
    // user
    GetUserProfileUseCaseService,
    CreateRegularUsereUseCaseService,
    GetOneRegularUserUseCaseService,
    // Access Requests
    GetManyNewAccessRequestsUseCase,
    GetManyRejectedAccessRequestsUseCase,
    CreateAccessRequestUseCase,
    GetAccessRequestUseCase,
    DeleteAccessRequestUseCase,
    ApproveAccessRequestUseCase,
    RejectAccessRequestUseCase,
    // Location
    GetCitiesUseCase,
    GetCountiesUseCase,
    // Activity Types
    CreateActivityTypeUseCase,
    UpdateActivityTypeUseCase,
    ActivateActivityTypeUseCase,
    ArchiveActivityTypeUseCase,
    GetOneActivityTypeUseCase,
    GetManyActivityTypeUseCase,
    // Volunteers
    GetOneVolunteerUsecase,
    CreateVolunteerUseCase,
    ArchiveVolunteerUsecase,
    BlockVolunteerUsecase,
    ActivateVolunteerUsecase,
    CreateVolunteerProfileUseCase,
    GetManyVolunteersUseCase,
    UpdateVolunteerProfileUsecase,
  ],
})
export class UseCaseModule {}
