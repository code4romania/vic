import { Module } from '@nestjs/common';
import { UseCaseModule } from 'src/usecases/use-case.module';
import { AuthController } from './auth/auth.controller';
import { HealthController } from './health/health.controller';
import { AccessCodeController } from './organization/access-code.controller';
import { OrganizationStructureController } from './organization/organization-structure.controller';
import { OrganizationController } from './organization/organization.controller';
import { AccessRequestController } from './access-request/access-request.controller';

@Module({
  imports: [UseCaseModule],
  controllers: [
    HealthController,
    OrganizationController,
    AuthController,
    AccessCodeController,
    OrganizationStructureController,
    AccessRequestController,
  ],
})
export class ApiModule {}
