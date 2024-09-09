import { Module } from '@nestjs/common';
import { UseCaseModule } from 'src/usecases/use-case.module';
import { AuthController } from './auth/auth.controller';
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
import { TemplateController } from './template/template.controller';
import { ContractController } from './contracts/contracts.controller';
import { MobileContractController } from './_mobile/contract/contract.controller';
import { MobileStatisticsController } from './_mobile/statistics/statistics.controller';
import { MobileAnouncementsController } from './_mobile/anouncements/anouncements.controller';
import { MobileSettingsController } from './_mobile/settings/settings-controller';
import { MobileNewsController } from './_mobile/news/news.controller';
import { DocumentTemplateController } from './documents/document-template.controller';
import { DocumentContractController } from './documents/document-contract.controller';

@Module({
  imports: [UseCaseModule],
  controllers: [
    PublicController,
    OrganizationController,
    AuthController,
    AccessCodeController,
    OrganizationStructureController,
    AccessRequestController,
    LocationController,
    ActivityTypeController,
    VolunteerController,
    AnnouncementController,
    EventController,
    ActivityLogController,
    ListingController,
    ActionsArchiveController,
    DashboardController,
    TemplateController,
    ContractController,
    DocumentTemplateController,
    DocumentContractController,
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
