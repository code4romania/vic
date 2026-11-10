import { AuthenticationModule } from 'src/modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { UseCaseModule } from 'src/usecases/use-case.module';
import { WebAuthController } from './auth/web-auth.controller';
import { OrganizationRegistrationController } from './organization/organization-registration.controller';
import { SecurityController } from './security/security.controller';
import { TeamController } from './organization/team.controller';
import { AdminOrganizationsController } from './admin/organizations.controller';
import { AdminVolunteersController } from './admin/volunteers.controller';
import { TokenController } from './auth/token.controller';
import { MobileAuthController } from './_mobile/auth/auth.controller';
import { PublicController } from './public/public.controller';
import { AccessCodeController } from './organization/access-code.controller';
import { OrganizationStructureController } from './organization/organization-structure.controller';
import { OrganizationController } from './organization/organization.controller';
import { AccessRequestController } from './access-request/access-request.controller';
import { MobileRegularUserController } from './_mobile/user/user.controller';
import { MobileAccessRequestController } from './_mobile/access-request/access-request.controller';
import { LocationController } from './location/location.controller';
import { ActivityTypeController } from './activity-type/activity-type.controller';
import { VolunteerController } from './volunteer/volunteer.controller';
import { MobileVolunteerController } from './_mobile/volunteer/volunteer.controller';
import { AnnouncementController } from './announcement/announcement.controller';
import { EventController } from './event/event.controller';
import { EventRegistrationsController } from './event-registrations/event-registrations.controller';
import { MobileEventController } from './_mobile/event/event.controller';
import { ActivityLogController } from './activity-log/activity-log.controller';
import { ListingController } from './listing/listing.controller';
import { ActionsArchiveController } from './actions-archive/actions-archive.controller';
import { DashboardController } from './dashboard/dashboard.controller';
import { MobilePushNotificationsController } from './_mobile/push-notifications/push-notifications.controller';
import { MobileOrganizationController } from './_mobile/organization/organization.controller';
import { MobileOrganizationStructureController } from './_mobile/organization/organization-structure.controller';
import { MobileActivityLogController } from './_mobile/activity-log/activity-log.controller';
import { MobileActivityTypeController } from './_mobile/activity-type/activity-type.controller';
import { ContractController } from './contracts/contracts.controller';
import { TemplateController } from './template/template.controller';
import { MobileContractController } from './_mobile/contract/contract.controller';
import { MobileStatisticsController } from './_mobile/statistics/statistics.controller';
import { MobileAnouncementsController } from './_mobile/anouncements/anouncements.controller';
import { MobileSettingsController } from './_mobile/settings/settings-controller';
import { MobileNewsController } from './_mobile/news/news.controller';

@Module({
  imports: [UseCaseModule, AuthenticationModule],
  controllers: [
    PublicController,
    OrganizationController,
    WebAuthController,
    TokenController,
    MobileAuthController,
    OrganizationRegistrationController,
    TeamController,
    SecurityController,
    AdminOrganizationsController,
    AdminVolunteersController,
    AccessCodeController,
    OrganizationStructureController,
    AccessRequestController,
    LocationController,
    ActivityTypeController,
    VolunteerController,
    AnnouncementController,
    EventController,
    EventRegistrationsController,
    ActivityLogController,
    ListingController,
    ActionsArchiveController,
    DashboardController,
    ContractController,
    TemplateController,
    // Mobile
    MobileRegularUserController,
    MobileAccessRequestController,
    MobileVolunteerController,
    MobileEventController,
    MobilePushNotificationsController,
    MobileOrganizationController,
    MobileOrganizationStructureController,
    MobileActivityLogController,
    MobileActivityTypeController,
    MobileContractController,
    MobileStatisticsController,
    MobileAnouncementsController,
    MobileSettingsController,
    MobileNewsController,
  ],
})
export class ApiModule {}
