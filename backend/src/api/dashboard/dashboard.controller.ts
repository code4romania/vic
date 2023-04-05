import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetDashboardVolunteerStatusTimeseriesUsecase } from 'src/usecases/dashboard/get-dashboard-volunteer-status-timeseries.usecase';
import { GetDashboardVolunteerGroupedUsecase } from 'src/usecases/dashboard/get-dashboard-volunteers-grouped.usecase';
import { GetVolunteerStatusTimeseriesDto } from './dto/get-volunteer-status-timeseries.dto';
import { GetVolunteersGroupedDto } from './dto/get-volunteers-grouped.dto';
import { VolunteerStatusTimeseriesPresenter } from './presenters/volunteer-status-timeseries.presenter';
import { VolunteersGroupedPresenter } from './presenters/volunteers-grouped.presenter';
import { GetDashboardVolunteersHoursUseCase } from 'src/usecases/dashboard/get-dashboard-volunteers-hours.usecase';
import { VolunteerHoursPresenter } from './presenters/volunteer-hours.presenter';
import { VolunteerStatusPresenter } from './presenters/volunteer-status.presenter';
import { GetDashboardVolunteersStatusUseCase } from 'src/usecases/dashboard/get-dashboard-volunteers-status.usecase';

@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getDashboardVolunteerStatusTimeseriesUsecase: GetDashboardVolunteerStatusTimeseriesUsecase,
    private readonly getDashboardVolunteerGroupedUsecase: GetDashboardVolunteerGroupedUsecase,
    private readonly getDashboardVolunteerHoursUseCase: GetDashboardVolunteersHoursUseCase,
    private readonly getDashboardVolunteerStatusUseCase: GetDashboardVolunteersStatusUseCase,
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

  @Get('volunteer-grouped')
  async getDashboardVolunteerGrouped(
    @Query() { group }: GetVolunteersGroupedDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<VolunteersGroupedPresenter[]> {
    return this.getDashboardVolunteerGroupedUsecase.execute({
      group,
      organizationId,
    });
  }

  @Get('volunteer-hours')
  async getDashboardVolunteerHours(
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<VolunteerHoursPresenter> {
    const data = await this.getDashboardVolunteerHoursUseCase.execute(
      organizationId,
    );

    return new VolunteerHoursPresenter(data);
  }

  @Get('volunteer-status')
  async getDashboardVolunteerStatus(
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<VolunteerStatusPresenter> {
    const data = await this.getDashboardVolunteerStatusUseCase.execute(
      organizationId,
    );

    return new VolunteerStatusPresenter(data);
  }
}
