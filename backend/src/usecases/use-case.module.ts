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
import { GetManyEventUseCase } from './event/get-many-event.usecase';
import { GetManyForDownloadEventUseCase } from './event/get-many-for-download-event.usecase';
import { CreateActivityLogByAdmin } from './activity-log/create-activity-log-by-admin.usecase';
import { ActivityLogModule } from 'src/modules/activity-log/activity-log.module';
import { GetOneActivityLogUsecase } from './activity-log/get-one-activity-log.usecase';
import { UpdateActivityLogUsecase } from './activity-log/update-activity-log.usecase';
import { ApproveActivityLogUsecase } from './activity-log/approve-activity-log.usecase';
import { RejectActivityLogUsecase } from './activity-log/reject-activity-log.usecase';
import { GetManyActivityLogsUsecase } from './activity-log/get-many-activity-logs.usecase';
import { GetManyAdminUsersUseCase } from './user/get-many-admin-users.usecase';
import { ActionsArchiveModule } from 'src/modules/actions-archive/actions-archive.module';
import { GetManyActionsArchiveUseCase } from './actions-archive/get-many-actions-archive.usecase';
import { GetActivityLogCountersUsecase } from './activity-log/get-activity-log-counters.usecase';
import { GetManyForDownloadEventRSVPUseCase } from './event/RSVP/get-many-for-download-rsvp.usecase';
import { DashboardModule } from 'src/modules/dashboard/dashboard.module';
import { GetDashboardVolunteerStatusTimeseriesUsecase } from './dashboard/get-dashboard-volunteer-status-timeseries.usecase';
import { GetDashboardVolunteerGroupedUsecase } from './dashboard/get-dashboard-volunteers-grouped.usecase';
import { GetDashboardVolunteersHoursUseCase } from './dashboard/get-dashboard-volunteers-hours.usecase';
import { GetDashboardVolunteersStatusUseCase } from './dashboard/get-dashboard-volunteers-status.usecase';
import { GetManyForDownloadActivityLogUseCase } from './activity-log/get-many-for-download-activity-log.usecase';
import { GetActivityLogCountUsecase } from './activity-log/get-activity-log-count.usecase';
import { RegisterDevicePushTokenUseCase } from './push-notifications/register-device-push-token.usecase';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { UnregisterDevicePushTokenUseCase } from './push-notifications/unregister-device-push-token.usecase';
import { GetCitiesByCountyIdUseCase } from './location/get-cities-by-county-id.usecase';
import { GetOrganizationsUseCase } from './organization/get-organizations.usecase';
import { GetOrganizationWithEventsUseCase } from './organization/get-organization-with-events.usecase';
import { UpdateUserPersonalDataUsecase } from './user/update-user-personal-data.usecase';
import { JoinOrganizationByAccessCodeUsecase } from './volunteer/join-organization-by-access-code.usecase';
import { CancelAccessRequestUsecase } from './access-request/cancel-access-request.usecase';
import { SwitchOrganizationUsecase } from './organization/switch-organization.usecase';
import { GetVolunteerProfileUsecase } from './volunteer/get-volunteer-profile.usecase';
import { GetMyEventsUsecase } from './event/get-my-events.usecase';
import { GetOneEventWithVolunteerStatusUsecase } from './event/get-one-event-with-volunteer-status.usecase';
import { CreateActivityLogByRegularUser } from './activity-log/create-activity-log-by-regular-user.usecase';
import { GetEventsByOrganizationUsecase } from './event/get-events-by-organization.usecase';
import { CancelActivityLogUsecase } from './activity-log/cancel-activity-log.usecase';
import { DocumentsModule } from 'src/modules/documents/documents.module';
import { CreateTemplateUsecase } from './documents/create-template.usecase';
import { GetTemplatesUsecase } from './documents/get-templates.usecase';
import { GetOneTemplateUseCase } from './documents/get-one-template.usecase';
import { UpdateTemplateUsecase } from './documents/update-template.usecase';
import { DeleteTemplateUseCase } from './documents/delete-template.usecase';
import { GetAllTemplatesUsecase } from './documents/get-all-templates.usecase';
import { GetManyContractsUsecase } from './documents/get-many-contracts.usecase';
import { CreateContractUsecase } from './documents/create-contract.usecase';
import { CountPendingContractsUsecase } from './documents/count-pending-contracts.usecase';
import { GetOneContractUsecase } from './documents/get-one-contract.usecase';
import { SignContractByVolunteer } from './documents/sign-contract-by-volunteer.usecase';
import { SignAndConfirmContractUsecase } from './documents/sign-and-confirm-contract.usecase';
import { RejectContractUsecase } from './documents/reject-contract.usecase';
import { GetTemplatesForDownloadUsecase } from './documents/get-templates-for-download.usecase';
import { GetContractsForDownloadUsecase } from './documents/get-contracts-for-download.usecase';
import { DeleteContractUsecase } from './documents/delete-contract.usecase';
import { GetVolunteerContractHistoryUsecase } from './documents/get-volunteer-contract-history.usecase';
import { GetVolunteerPendingContractsUsecase } from './documents/get-volunteer-pending-contracts.usecase';
import { CancelContractUsecase } from './documents/cancel-contract.usecase';
import { UpdateRegularUserUsecase } from './user/update-regular-user.usecase';
import { GetVolunteerMonthlyNewsStatisticsUsecase } from './dashboard/get-volunteer-monthly-news.usecase';
import { GetVicStatisticsUsecase } from './dashboard/get-vic-statistics.usecase';
import { GetManyAnouncementsByUserAsUsecase } from './announcement/get-many-anouncements-by-user.usecase';
import { LeaveOrganizationUsecase } from './organization/leave-organization.usecase';
import { RejoinOrganizationUsecase } from './organization/rejoin-organization.usecase';
import { UpdateSettingsUsecase } from './notifications-settings/update-settings.usecase';
import { GetVolunteersUserDataForNotificationsUsecase } from './volunteer/get-volunteers-user-data-for-notifications.usecase';
import { GetManyNewsUsecase } from './actions-archive/get-many-news.usecase';
import { GetVolunteerOrganizationStatusUsecase } from './volunteer/get-volunteer-organization-status.usecase';
import { GetOneRegularUserProfileUseCase } from './user/get-regule-user-profile.usecase';
import { SyncUserOrganizationsUsecase } from './user/sync-user-organizations.usecase';
import { GetRejectedAccessRequestUsecase } from './access-request/get-rejected-access-request.usecase';
import { DeleteAccountRegularUserUsecase } from './user/delete-account.usecase';
import { GeneratePDFsUseCase } from './documents/generate-pdfs.usecase';
import { SyncWithOngHubUseCaseService } from './organization/sync-with-ngohub.usecase';

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
    ActivityLogModule,
    ActionsArchiveModule,
    DashboardModule,
    NotificationsModule,
    DocumentsModule,
  ],
  providers: [
    // Organization
    GetOrganizationUseCaseService,
    UpdateOrganizationDescriptionUseCaseService,
    GetOrganizationsUseCase,
    GetOrganizationWithEventsUseCase,
    SwitchOrganizationUsecase,
    LeaveOrganizationUsecase,
    RejoinOrganizationUsecase,
    SyncWithOngHubUseCaseService,
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
    GetManyAdminUsersUseCase,
    UpdateUserPersonalDataUsecase,
    UpdateRegularUserUsecase,
    GetOneRegularUserProfileUseCase,
    SyncUserOrganizationsUsecase,
    DeleteAccountRegularUserUsecase,
    // Access Requests
    GetManyNewAccessRequestsUseCase,
    GetManyRejectedAccessRequestsUseCase,
    CreateAccessRequestUseCase,
    GetAccessRequestUseCase,
    DeleteAccessRequestUseCase,
    ApproveAccessRequestUseCase,
    RejectAccessRequestUseCase,
    GetAccessRequestsForDownloadUseCase,
    JoinOrganizationByAccessCodeUsecase,
    CancelAccessRequestUsecase,
    GetRejectedAccessRequestUsecase,
    // Location
    GetCitiesUseCase,
    GetCountiesUseCase,
    GetCitiesByCountyIdUseCase,
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
    GetVolunteerProfileUsecase,
    GetVolunteersUserDataForNotificationsUsecase,
    GetVolunteerOrganizationStatusUsecase,
    // Announcement
    GetOneAnnouncementUseCase,
    GetManyAnnouncementUseCase,
    CreateAnnouncementUseCase,
    UpdateAnnouncementUseCase,
    DeleteAnnouncementUseCase,
    GetManyAnouncementsByUserAsUsecase,
    // Events
    CreateEventUseCase,
    GetOneEventUseCase,
    UpdateEventUseCase,
    DeleteEventUseCase,
    PublishEventUseCase,
    ArchiveEventUseCase,
    GetManyForDownloadEventUseCase,
    GetManyEventUseCase,
    GetMyEventsUsecase,
    GetOneEventWithVolunteerStatusUsecase,
    GetEventsByOrganizationUsecase,
    // Events RSVP
    CreateEventRSVPUseCase,
    GetOneEventRSVPUseCase,
    DeleteEventRSVPUseCase,
    GetManyEventRSVPUseCase,
    GetManyForDownloadEventRSVPUseCase,
    // Activity Log
    CreateActivityLogByAdmin,
    GetOneActivityLogUsecase,
    UpdateActivityLogUsecase,
    ApproveActivityLogUsecase,
    RejectActivityLogUsecase,
    GetManyActivityLogsUsecase,
    GetActivityLogCountersUsecase,
    GetManyForDownloadActivityLogUseCase,
    GetActivityLogCountUsecase,
    CreateActivityLogByRegularUser,
    CancelActivityLogUsecase,
    // Actions Archive
    GetManyActionsArchiveUseCase,
    GetManyNewsUsecase,
    // Dashboard
    GetDashboardVolunteerStatusTimeseriesUsecase,
    GetDashboardVolunteerGroupedUsecase,
    GetDashboardVolunteersHoursUseCase,
    GetDashboardVolunteersStatusUseCase,
    // Push Notifications
    RegisterDevicePushTokenUseCase,
    UnregisterDevicePushTokenUseCase,
    GetVolunteerMonthlyNewsStatisticsUsecase,
    GetVicStatisticsUsecase,
    // Templates
    CreateTemplateUsecase,
    GetTemplatesUsecase,
    GetOneTemplateUseCase,
    UpdateTemplateUsecase,
    DeleteTemplateUseCase,
    GetAllTemplatesUsecase,
    GetTemplatesForDownloadUsecase,
    // Contracts
    CreateContractUsecase,
    GetManyContractsUsecase,
    CountPendingContractsUsecase,
    GetOneContractUsecase,
    SignContractByVolunteer,
    SignAndConfirmContractUsecase,
    SignAndConfirmContractUsecase,
    RejectContractUsecase,
    GetContractsForDownloadUsecase,
    DeleteContractUsecase,
    GetVolunteerContractHistoryUsecase,
    GetVolunteerPendingContractsUsecase,
    CancelContractUsecase,
    // Notifications
    UpdateSettingsUsecase,
    // Testing PDFs
    GeneratePDFsUseCase,
  ],
  exports: [
    // Organization
    GetOrganizationUseCaseService,
    UpdateOrganizationDescriptionUseCaseService,
    GetOrganizationsUseCase,
    GetOrganizationWithEventsUseCase,
    SwitchOrganizationUsecase,
    LeaveOrganizationUsecase,
    RejoinOrganizationUsecase,
    SyncWithOngHubUseCaseService,
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
    GetManyAdminUsersUseCase,
    UpdateUserPersonalDataUsecase,
    UpdateRegularUserUsecase,
    GetOneRegularUserProfileUseCase,
    SyncUserOrganizationsUsecase,
    DeleteAccountRegularUserUsecase,
    // Access Requests
    GetManyNewAccessRequestsUseCase,
    GetManyRejectedAccessRequestsUseCase,
    CreateAccessRequestUseCase,
    GetAccessRequestUseCase,
    DeleteAccessRequestUseCase,
    ApproveAccessRequestUseCase,
    RejectAccessRequestUseCase,
    GetAccessRequestsForDownloadUseCase,
    JoinOrganizationByAccessCodeUsecase,
    CancelAccessRequestUsecase,
    GetRejectedAccessRequestUsecase,
    // Location
    GetCitiesUseCase,
    GetCountiesUseCase,
    GetCitiesByCountyIdUseCase,
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
    GetVolunteerProfileUsecase,
    GetVolunteersUserDataForNotificationsUsecase,
    GetVolunteerOrganizationStatusUsecase,
    // Announcement
    GetOneAnnouncementUseCase,
    GetManyAnnouncementUseCase,
    CreateAnnouncementUseCase,
    UpdateAnnouncementUseCase,
    DeleteAnnouncementUseCase,
    CreateEventUseCase,
    GetManyAnouncementsByUserAsUsecase,
    // Events
    CreateEventUseCase,
    GetOneEventUseCase,
    UpdateEventUseCase,
    DeleteEventUseCase,
    PublishEventUseCase,
    ArchiveEventUseCase,
    GetManyEventUseCase,
    GetManyForDownloadEventUseCase,
    GetMyEventsUsecase,
    GetOneEventWithVolunteerStatusUsecase,
    GetEventsByOrganizationUsecase,
    // Events RSVP
    CreateEventRSVPUseCase,
    GetOneEventRSVPUseCase,
    DeleteEventRSVPUseCase,
    GetManyEventRSVPUseCase,
    GetManyForDownloadEventRSVPUseCase,
    // Activity Log
    CreateActivityLogByAdmin,
    GetOneActivityLogUsecase,
    UpdateActivityLogUsecase,
    ApproveActivityLogUsecase,
    RejectActivityLogUsecase,
    GetManyActivityLogsUsecase,
    GetActivityLogCountersUsecase,
    GetManyForDownloadActivityLogUseCase,
    GetActivityLogCountUsecase,
    CreateActivityLogByRegularUser,
    CancelActivityLogUsecase,
    // Actions Archive
    GetManyActionsArchiveUseCase,
    GetManyNewsUsecase,
    // Dashboard
    GetDashboardVolunteerStatusTimeseriesUsecase,
    GetDashboardVolunteerGroupedUsecase,
    GetDashboardVolunteersHoursUseCase,
    GetDashboardVolunteersStatusUseCase,
    // Push Notifications
    RegisterDevicePushTokenUseCase,
    UnregisterDevicePushTokenUseCase,
    GetVolunteerMonthlyNewsStatisticsUsecase,
    // Templates
    CreateTemplateUsecase,
    GetTemplatesUsecase,
    GetOneTemplateUseCase,
    UpdateTemplateUsecase,
    DeleteTemplateUseCase,
    GetAllTemplatesUsecase,
    GetTemplatesForDownloadUsecase,
    // Contracts
    CreateContractUsecase,
    GetManyContractsUsecase,
    CountPendingContractsUsecase,
    GetOneContractUsecase,
    SignContractByVolunteer,
    SignAndConfirmContractUsecase,
    SignAndConfirmContractUsecase,
    RejectContractUsecase,
    GetContractsForDownloadUsecase,
    DeleteContractUsecase,
    GetVolunteerContractHistoryUsecase,
    GetVolunteerPendingContractsUsecase,
    CancelContractUsecase,
    GetVicStatisticsUsecase,
    // Notifications
    UpdateSettingsUsecase,
    // Testing PDFs
    GeneratePDFsUseCase,
  ],
})
export class UseCaseModule {}
