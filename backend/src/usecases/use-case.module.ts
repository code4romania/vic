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
import { GetOneRegularUserUseCase } from './user/get-one-regular-user.usecase';
import { CreateVolunteerUseCase } from './volunteer/create-volunteer.usecase';
import { GetOneVolunteerUsecase } from './volunteer/get-one-volunteer.usecase';
import { CreateVolunteerProfileUseCase } from './volunteer/create-volunteer-profile.usecase';
import { GetManyVolunteersUseCase } from './volunteer/get-many-volunteers.usecase';
import { ArchiveVolunteerUsecase } from './volunteer/archive-volunteer.usescase';
import { BlockVolunteerUsecase } from './volunteer/block-volunteer.usecase';
import { ActivateVolunteerUsecase } from './volunteer/activate-volunteer.usecase';
import { UpdateVolunteerProfileUsecase } from './volunteer/update-volunteer-profile.usecase';
import { AnnouncementModule } from 'src/modules/announcement/announcement.module';
import { GetOneAnnouncementUseCase } from './announcement/get-one-announcement.usecase';
import { GetManyAnnouncementUseCase } from './announcement/get-many-announcement.usecase';
import { CreateAnnouncementUseCase } from './announcement/create-announcement.usecase';
import { UpdateAnnouncementUseCase } from './announcement/update-announcement.usecase';
import { DeleteAnnouncementUseCase } from './announcement/delete-announcement.usecase';
import { EventModule } from 'src/modules/event/event.module';
import { CreateEventUseCase } from './event/create-event.usecase';
import { GetOneEventUseCase } from './event/get-one-event.usecase';
import { UpdateEventUseCase } from './event/update-event.usecase';
import { PublishEventUseCase } from './event/publish-event.usecase';
import { ArchiveEventUseCase } from './event/archive-event.usecase';
import { DeleteEventUseCase } from './event/delete-event.usecase';
import { CreateEventRSVPUseCase } from './event/RSVP/create-rsvp.usecase';
import { GetOneEventRSVPUseCase } from './event/RSVP/get-one-rsvp.usecase';
import { DeleteEventRSVPUseCase } from './event/RSVP/delete-rsvp.usecase';
import { GetAccessRequestsForDownloadUseCase } from './access-request/get-many-for-download-access-requests.usecase';
import { GetVolunteersForDownloadUseCase } from './volunteer/get-many-for-download-volunteer.usecase';
import { GetManyEventRSVPUseCase } from './event/RSVP/get-many-rsvp.usecase';

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
    AnnouncementModule,
    EventModule,
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
    GetOneRegularUserUseCase,
    // Access Requests
    GetManyNewAccessRequestsUseCase,
    GetManyRejectedAccessRequestsUseCase,
    CreateAccessRequestUseCase,
    GetAccessRequestUseCase,
    DeleteAccessRequestUseCase,
    ApproveAccessRequestUseCase,
    RejectAccessRequestUseCase,
    GetAccessRequestsForDownloadUseCase,
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
    GetVolunteersForDownloadUseCase,
    // Announcement
    GetOneAnnouncementUseCase,
    GetManyAnnouncementUseCase,
    CreateAnnouncementUseCase,
    UpdateAnnouncementUseCase,
    DeleteAnnouncementUseCase,
    // Events
    CreateEventUseCase,
    GetOneEventUseCase,
    UpdateEventUseCase,
    DeleteEventUseCase,
    PublishEventUseCase,
    ArchiveEventUseCase,
    // Events RSVP
    CreateEventRSVPUseCase,
    GetOneEventRSVPUseCase,
    DeleteEventRSVPUseCase,
    GetManyEventRSVPUseCase,
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
    // User
    GetUserProfileUseCaseService,
    CreateRegularUsereUseCaseService,
    GetOneRegularUserUseCase,
    // Access Requests
    GetManyNewAccessRequestsUseCase,
    GetManyRejectedAccessRequestsUseCase,
    CreateAccessRequestUseCase,
    GetAccessRequestUseCase,
    DeleteAccessRequestUseCase,
    ApproveAccessRequestUseCase,
    RejectAccessRequestUseCase,
    GetAccessRequestsForDownloadUseCase,
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
    GetVolunteersForDownloadUseCase,
    // Announcement
    GetOneAnnouncementUseCase,
    GetManyAnnouncementUseCase,
    CreateAnnouncementUseCase,
    UpdateAnnouncementUseCase,
    DeleteAnnouncementUseCase,
    CreateEventUseCase,
    // Events
    CreateEventUseCase,
    GetOneEventUseCase,
    UpdateEventUseCase,
    DeleteEventUseCase,
    PublishEventUseCase,
    ArchiveEventUseCase,
    // Events RSVP
    CreateEventRSVPUseCase,
    GetOneEventRSVPUseCase,
    DeleteEventRSVPUseCase,
    GetManyEventRSVPUseCase,
  ],
})
export class UseCaseModule {}
