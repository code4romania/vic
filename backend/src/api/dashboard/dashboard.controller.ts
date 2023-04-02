import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetDashboardVolunteerStatusTimeseriesUsecase } from 'src/usecases/dashboard/get-dashboard-volunteer-status-timeseries.usecase';
import { GetVolunteerStatusTimeseriesDto } from './dto/get-volunteer-status-timeseries.dto';
import { VolunteerStatusTimeseriesPresenter } from './presenters/volunteer-status-timeseries.presenter';

@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getDashboardVolunteerStatusTimeseriesUsecase: GetDashboardVolunteerStatusTimeseriesUsecase,
  ) {}

  @Get('volunteer-status-timeseries')
  async getDashboardVolunteerStatusTimeseries(
    @Query() { interval }: GetVolunteerStatusTimeseriesDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<VolunteerStatusTimeseriesPresenter[]> {
    return this.getDashboardVolunteerStatusTimeseriesUsecase.execute({
      interval,
      organizationId,
    });
  }
}
