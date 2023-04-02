import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { DashboardFilterInterval } from 'src/modules/dashboard/enums/dashboard-filter-interval.enum';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetDashboardVolunteerStatusTimeseriesUsecase } from 'src/usecases/dashboard/get-dashboard-volunteer-status-timeseries.usecase';

@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getDashboardVolunteerStatusTimeseriesUsecase: GetDashboardVolunteerStatusTimeseriesUsecase,
  ) {}

  @Get('volunteer-status-timeseries')
  async getDashboardVolunteerStatusTimeseries(
    // @Query() filters: GetManyAnnouncementDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<unknown> {
    return this.getDashboardVolunteerStatusTimeseriesUsecase.execute({
      interval: DashboardFilterInterval.DAILY,
      organizationId,
    });
  }
}
