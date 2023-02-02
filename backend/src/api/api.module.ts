import { Module } from '@nestjs/common';
import { UseCaseModule } from 'src/usecases/use-case.module';
import { HealthController } from './health/health.controller';
import { OrganizationController } from './organization/organization.controller';
import { UserController } from './user/user.controller';

@Module({
  imports: [UseCaseModule],
  controllers: [HealthController, OrganizationController, UserController],
})
export class ApiModule {}
