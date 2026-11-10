import {
  Body,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Post } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { CreateActivityLogByAdminDto } from 'src/api/activity-log/dto/create-activity-log-by-admin.dto';
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
import { CancelActivityLogUsecase } from 'src/usecases/activity-log/cancel-activity-log.usecase';
import { UpdateActivityLogDto } from 'src/api/activity-log/dto/update-activity-log.dto';
import { UpdateActivityLogUsecase } from 'src/usecases/activity-log/update-activity-log.usecase';
import { ActivityLogMobileGuard } from './guards/activity-log-mobile.guard';
import { CreateActivityLogByVolunteerDto } from './dto/create-activity-log-by-volunteer.dto';
import { emptyPagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { MobileOwnershipService } from 'src/usecases/volunteer/mobile-ownership.service';

@ApiBearerAuth()
// The volunteer is always the user of the token in their active organization (audit B2).
@UseGuards(MobileJwtAuthGuard, ActivityLogMobileGuard)
@Controller('mobile/activity-log')
export class MobileActivityLogController {
  constructor(
    private readonly createActivityLogByRegularUser: CreateActivityLogByRegularUser,
    private readonly getManyActivityLogsUsecase: GetManyActivityLogsUsecase,
    private readonly getActivityLogCountersUsecase: GetActivityLogCountersUsecase,
    private readonly getOneActivityLogUsecase: GetOneActivityLogUsecase,
    private readonly cancelActivityLogUsecase: CancelActivityLogUsecase,
    private readonly updateActivityLogUsecase: UpdateActivityLogUsecase,
    private readonly ownership: MobileOwnershipService,
  ) {}

  @Get()
  @ApiPaginatedResponse(MobileActivityLogListItemPresenter)
  async getMany(
    @Query() filters: GetActivityLogsForVolunteerDto,
    @ExtractUser() { activeOrganization }: IRegularUserModel,
  ): Promise<PaginatedPresenter<MobileActivityLogListItemPresenter>> {
    // No active organization: nothing to list (it used to answer 500)
    if (!activeOrganization?.volunteerId) {
      return new PaginatedPresenter(emptyPagination(filters.limit));
    }

    const logs = await this.getManyActivityLogsUsecase.execute({
      ...filters,
      orderBy: 'date',
      organizationId: activeOrganization.id,
      volunteerId: activeOrganization.volunteerId,
    });

    return new PaginatedPresenter({
      ...logs,
      items: logs.items.map(
        (log) => new MobileActivityLogListItemPresenter(log),
      ),
    });
  }

  @Get('counters')
  async getCountHoursByStatus(
    // ?volunteerId is kept for older apps and ignored: the totals are always the user's own
    @Query() _filters: GetManyActivityLogCountersDto,
    @ExtractUser() { activeOrganization }: IRegularUserModel,
  ): Promise<ActivityLogCountersPresenter> {
    if (!activeOrganization?.volunteerId) {
      return new ActivityLogCountersPresenter({
        pending: 0,
        approved: 0,
        rejected: 0,
      });
    }

    const counters = await this.getActivityLogCountersUsecase.execute({
      volunteerId: activeOrganization.volunteerId,
      organizationId: activeOrganization.id,
    });
    return new ActivityLogCountersPresenter(counters);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async get(
    @Param('id', UuidValidationPipe) activityLogId: string,
  ): Promise<MobileActivityLogPresenter> {
    const log = await this.getOneActivityLogUsecase.execute(activityLogId);
    return new MobileActivityLogPresenter(log);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Delete(':id')
  async cancel(
    @Param('id', UuidValidationPipe) activityLogId: string,
    @ExtractUser() regularUser: IRegularUserModel,
  ): Promise<void> {
    await this.cancelActivityLogUsecase.execute(activityLogId, regularUser);
  }

  @ApiBody({ type: CreateActivityLogByVolunteerDto })
  @Post()
  async create(
    @Body() createActivityLog: CreateActivityLogByVolunteerDto,
    @ExtractUser() regularUser: IRegularUserModel,
  ): Promise<MobileActivityLogPresenter> {
    // Hours are logged for the user's own volunteer in the active organization. A volunteerId in
    // the body (older apps send it) must be that one.
    const volunteerId = this.ownership.activeVolunteerId(
      regularUser,
      createActivityLog.volunteerId,
    );

    const log = await this.createActivityLogByRegularUser.execute(
      { ...createActivityLog, volunteerId } as CreateActivityLogByAdminDto,
      regularUser,
    );

    return new MobileActivityLogPresenter(log);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateActivityLogDto })
  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) activityLogId: string,
    @Body() updates: UpdateActivityLogDto,
    @ExtractUser() regularUser: IRegularUserModel,
  ): Promise<MobileActivityLogPresenter> {
    const activityLog = await this.updateActivityLogUsecase.execute(
      activityLogId,
      updates,
      regularUser,
    );
    return new MobileActivityLogPresenter(activityLog);
  }
}
