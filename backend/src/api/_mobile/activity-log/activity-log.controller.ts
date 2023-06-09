import { Body, Get, Param, Query, UseGuards } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { CreateActivityLogByAdminDto } from 'src/api/activity-log/dto/create-activity-log-by-admin.dto';
import { ActivityLogPresenter } from 'src/api/activity-log/presenters/activity-log.presenter';
import { CreateActivityLogByRegularUser } from 'src/usecases/activity-log/create-activity-log-by-regular-user.usecase';
import { GetActivityLogsForVolunteerDto } from './dto/get-activity-logs-for-volunteer.dto';
import { GetManyActivityLogsUsecase } from 'src/usecases/activity-log/get-many-activity-logs.usecase';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { MobileActivityLogListItemPresenter } from './presenters/activity-log-list-item-presenter';
import { GetManyActivityLogCountersDto } from 'src/api/activity-log/dto/get-many-activity-log-counters.dto';
import { ActivityLogCountersPresenter } from 'src/api/activity-log/presenters/activity-log-counters.presenter';
import { GetActivityLogCountersUsecase } from 'src/usecases/activity-log/get-activity-log-counters.usecase';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { GetOneActivityLogUsecase } from 'src/usecases/activity-log/get-one-activity-log.usecase';
import { MobileActivityLogPresenter } from './presenters/activity-log.presenter';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('mobile/activity-log')
export class MobileActivityLogController {
  constructor(
    private readonly createActivityLogByRegularUser: CreateActivityLogByRegularUser,
    private readonly getManyActivityLogsUsecase: GetManyActivityLogsUsecase,
    private readonly getActivityLogCountersUsecase: GetActivityLogCountersUsecase,
    private readonly getOneActivityLogUsecase: GetOneActivityLogUsecase,
  ) {}

  // TODO: VolunteerGuard
  @Get()
  @ApiPaginatedResponse(MobileActivityLogListItemPresenter)
  async getMany(
    @Query() filters: GetActivityLogsForVolunteerDto,
    @ExtractUser() { activeOrganization }: IRegularUserModel,
  ): Promise<PaginatedPresenter<MobileActivityLogListItemPresenter>> {
    const logs = await this.getManyActivityLogsUsecase.execute({
      ...filters,
      organizationId: activeOrganization.id,
    });

    return new PaginatedPresenter({
      ...logs,
      items: logs.items.map(
        (log) => new MobileActivityLogListItemPresenter(log),
      ),
    });
  }

  // TODO: VolunteerGuard
  @Get('counters')
  async getCountHoursByStatus(
    @Query() { volunteerId }: GetManyActivityLogCountersDto,
    @ExtractUser() { activeOrganization }: IRegularUserModel,
  ): Promise<ActivityLogCountersPresenter> {
    const counters = await this.getActivityLogCountersUsecase.execute({
      volunteerId,
      organizationId: activeOrganization.id,
    });
    return new ActivityLogCountersPresenter(counters);
  }

  // TODO: VolunteerGuard
  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async get(
    @Param('id', UuidValidationPipe) activityLogId: string,
  ): Promise<MobileActivityLogPresenter> {
    const log = await this.getOneActivityLogUsecase.execute(activityLogId);
    return new MobileActivityLogPresenter(log);
  }

  @ApiBody({ type: CreateActivityLogByAdminDto })
  @Post()
  async create(
    @Body() createActivityLog: CreateActivityLogByAdminDto,
    @ExtractUser() regularUser: IRegularUserModel,
  ): Promise<ActivityLogPresenter> {
    const log = await this.createActivityLogByRegularUser.execute(
      createActivityLog,
      regularUser,
    );

    return new ActivityLogPresenter(log);
  }
}
