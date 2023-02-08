import { Module } from '@nestjs/common';
import { UseCaseModule } from 'src/usecases/use-case.module';
import { HealthController } from './health/health.controller';
import { AccessCodeController } from './organization/access-code.controller';
import { OrganizationController } from './organization/organization.controller';

@Module({
  imports: [UseCaseModule],
  controllers: [HealthController, OrganizationController, AccessCodeController],
})
export class ApiModule {}
