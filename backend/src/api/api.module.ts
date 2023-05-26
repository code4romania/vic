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
import { MobileOrganizationController } from './_mobile/organization/organization.controller';

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
    // Mobile
    MobileRegularUserController,
    MobileAccessRequestController,
    MobileVolunteerController,
    MobileEventController,
    MobileOrganizationController,
  ],
})
export class ApiModule {}
