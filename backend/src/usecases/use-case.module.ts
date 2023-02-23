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
import { ActivityTypeModule } from 'src/modules/activity-type/activity-type.module';
import { CreateActivityTypeUseCase } from './activity-type/create-activity-type.usecase';
import { UpdateActivityTypeUseCase } from './activity-type/update-activity-type.usecase';
import { ActivateActivityTypeUseCase } from './activity-type/activate-activity-type.usecase';
import { ArchiveActivityTypeUseCase } from './activity-type/archive-activity-type.usecase';
import { GetOneActivityTypeUseCase } from './activity-type/get-one-activity-type.usecase';
import { GetManyActivityTypeUseCase } from './activity-type/get-all-activity-type.usecase';
import { AnnouncementModule } from 'src/modules/announcement/announcement.module';
import { GetOneAnnouncementUseCase } from './announcement/get-one-announcement.usecase';
import { GetAllAnnouncementUseCase } from './announcement/get-all-announcement.usecase';
import { CreateAnnouncementUseCase } from './announcement/create-announcement.usecase';
import { UpdateAnnouncementUseCase } from './announcement/update-announcement.usecase';
import { DeleteAnnouncementUseCase } from './announcement/delete-announcement.usecase';

@Module({
  imports: [
    ExceptionsModule,
    OrganizationModule,
    OngHubModule,
    UserModule,
    AccessRequestModule,
    ActivityTypeModule,
    AnnouncementModule,
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
    // User
    GetUserProfileUseCaseService,
    CreateRegularUsereUseCaseService,
    // Access Requests
    GetManyNewAccessRequestsUseCase,
    GetManyRejectedAccessRequestsUseCase,
    CreateAccessRequestUseCase,
    GetAccessRequestUseCase,
    DeleteAccessRequestUseCase,
    ApproveAccessRequestUseCase,
    RejectAccessRequestUseCase,
    // Activity Types
    CreateActivityTypeUseCase,
    UpdateActivityTypeUseCase,
    ActivateActivityTypeUseCase,
    ArchiveActivityTypeUseCase,
    GetOneActivityTypeUseCase,
    GetManyActivityTypeUseCase,
    // Announcement
    GetOneAnnouncementUseCase,
    GetAllAnnouncementUseCase,
    CreateAnnouncementUseCase,
    UpdateAnnouncementUseCase,
    DeleteAnnouncementUseCase,
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
    // user
    GetUserProfileUseCaseService,
    CreateRegularUsereUseCaseService,
    // Access Requests
    GetManyNewAccessRequestsUseCase,
    GetManyRejectedAccessRequestsUseCase,
    CreateAccessRequestUseCase,
    GetAccessRequestUseCase,
    DeleteAccessRequestUseCase,
    ApproveAccessRequestUseCase,
    RejectAccessRequestUseCase,
    // Activity Types
    CreateActivityTypeUseCase,
    UpdateActivityTypeUseCase,
    ActivateActivityTypeUseCase,
    ArchiveActivityTypeUseCase,
    GetOneActivityTypeUseCase,
    GetManyActivityTypeUseCase,
    // Announcement
    GetOneAnnouncementUseCase,
    GetAllAnnouncementUseCase,
    CreateAnnouncementUseCase,
    UpdateAnnouncementUseCase,
    DeleteAnnouncementUseCase,
  ],
})
export class UseCaseModule {}
