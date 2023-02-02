import { Module } from '@nestjs/common';
import { UseCaseModule } from 'src/usecases/use-case.module';
import { HealthController } from './health/health.controller';
import { OrganizationController } from './organization/organization.controller';

@Module({
  imports: [UseCaseModule],
  controllers: [HealthController, OrganizationController],
})
export class ApiModule {}
