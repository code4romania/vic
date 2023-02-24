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
import { AnnouncementController } from './announcement/announcement.controller';

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
    AnnouncementController,
    // Mobile
    MobileRegularUserController,
    MobileAccessRequestController,
  ],
})
export class ApiModule {}
