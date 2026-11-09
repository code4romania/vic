import {
  GetPendingApprovalsUseCase,
  IPendingApprovals,
} from 'src/usecases/dashboard/get-pending-approvals.usecase';
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
import {
  GetDashboardOverviewUsecase,
  IDashboardAnnouncementResponse,
  IDashboardOverview,
  IDashboardUpcomingEvent,
} from 'src/usecases/dashboard/get-dashboard-overview.usecase';

@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getDashboardVolunteerStatusTimeseriesUsecase: GetDashboardVolunteerStatusTimeseriesUsecase,
    private readonly getDashboardVolunteerGroupedUsecase: GetDashboardVolunteerGroupedUsecase,
    private readonly getDashboardVolunteerHoursUseCase: GetDashboardVolunteersHoursUseCase,
    private readonly getDashboardVolunteerStatusUseCase: GetDashboardVolunteersStatusUseCase,
    private readonly getPendingApprovalsUseCase: GetPendingApprovalsUseCase,
    private readonly getDashboardOverviewUsecase: GetDashboardOverviewUsecase,
  ) {}

  // #466: Voluntari activi, Evenimente viitoare, Contracte în așteptare, Ore voluntariat
  @Get('overview')
  async getOverview(
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<IDashboardOverview> {
    return this.getDashboardOverviewUsecase.overview(organizationId);
  }

  // #467: the next 3 events
  @Get('upcoming-events')
  async getUpcomingEvents(
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<IDashboardUpcomingEvent[]> {
    return this.getDashboardOverviewUsecase.upcomingEvents(organizationId);
  }

  // #467: the last 3 responses to announcements
  @Get('announcement-responses')
  async getLatestResponses(
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<IDashboardAnnouncementResponse[]> {
    return this.getDashboardOverviewUsecase.latestResponses(organizationId);
  }

  // #499 / #468: pending approvals per type and in total
  @Get('pending-approvals')
  async getPendingApprovals(
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<IPendingApprovals> {
    return this.getPendingApprovalsUseCase.execute(organizationId);
  }

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
    const data =
      await this.getDashboardVolunteerHoursUseCase.execute(organizationId);

    return new VolunteerHoursPresenter(data);
  }

  @Get('volunteer-status')
  async getDashboardVolunteerStatus(
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<VolunteerStatusPresenter> {
    const data =
      await this.getDashboardVolunteerStatusUseCase.execute(organizationId);

    return new VolunteerStatusPresenter(data);
  }
}
