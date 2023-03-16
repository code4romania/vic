import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { ApproveActivityLogUsecase } from 'src/usecases/activity-log/approve-activity-log.usecase';
import { CreateActivityLogByAdmin } from 'src/usecases/activity-log/create-activity-log-by-admin.usecase';
import { GetManyActivityLogsUsecase } from 'src/usecases/activity-log/get-many-activity-logs.usecase';
import { GetOneActivityLogUsecase } from 'src/usecases/activity-log/get-one-activity-log.usecase';
import { RejectActivityLogUsecase } from 'src/usecases/activity-log/reject-activity-log.usecase';
import { UpdateActivityLogUsecase } from 'src/usecases/activity-log/update-activity-log.usecase';
import { CreateActivityLogByAdminDto } from './dto/create-activity-log-by-admin.dto';
import { GetManyActivityLogsDto } from './dto/get-many-activity-logs.dto';
import { RejectActivityLogDto } from './dto/reject-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';
import { ActivityLogListItemPresenter } from './presenters/activity-log-list-item.presenter';
import { ActivityLogPresenter } from './presenters/activity-log.presenter';

@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('activity-log')
export class ActivityLogController {
  constructor(
    private readonly createActivityLogUseCase: CreateActivityLogByAdmin,
    private readonly getOneActivityLogUsecase: GetOneActivityLogUsecase,
    private readonly getManyActivityLogsUsecase: GetManyActivityLogsUsecase,
    private readonly updateActivityLogUsecase: UpdateActivityLogUsecase,
    private readonly approveActivityLogUsecase: ApproveActivityLogUsecase,
    private readonly rejectActivityLogUsecase: RejectActivityLogUsecase,
  ) {}

  @ApiBody({ type: CreateActivityLogByAdminDto })
  @Post()
  async create(
    @Body() createActivityLog: CreateActivityLogByAdminDto,
    @ExtractUser() adminUser: IAdminUserModel,
  ): Promise<ActivityLogPresenter> {
    const log = await this.createActivityLogUseCase.execute(
      createActivityLog,
      adminUser,
    );

    return new ActivityLogPresenter(log);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async get(
    @Param('id', UuidValidationPipe) activityLogId: string,
  ): Promise<ActivityLogPresenter> {
    const log = await this.getOneActivityLogUsecase.execute(activityLogId);
    return new ActivityLogPresenter(log);
  }

  @Get()
  @ApiPaginatedResponse(ActivityLogListItemPresenter)
  async getMany(
    @Query() filters: GetManyActivityLogsDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<PaginatedPresenter<ActivityLogListItemPresenter>> {
    const logs = await this.getManyActivityLogsUsecase.execute({
      ...filters,
      organizationId,
    });

    return new PaginatedPresenter({
      ...logs,
      items: logs.items.map((log) => new ActivityLogListItemPresenter(log)),
    });
  }

  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateActivityLogDto })
  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) activityLogId: string,
    @Body() updates: UpdateActivityLogDto,
  ): Promise<ActivityLogPresenter> {
    const activityType = await this.updateActivityLogUsecase.execute(
      activityLogId,
      updates,
    );
    return new ActivityLogPresenter(activityType);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Patch(':id/approve')
  async approve(
    @Param('id', UuidValidationPipe) activityLogId: string,
    @ExtractUser() adminUser: IAdminUserModel,
  ): Promise<ActivityLogPresenter> {
    const activityType = await this.approveActivityLogUsecase.execute(
      activityLogId,
      adminUser,
    );
    return new ActivityLogPresenter(activityType);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: RejectActivityLogDto })
  @Patch(':id/reject')
  async reject(
    @Param('id', UuidValidationPipe) activityLogId: string,
    @Body() rejectActivityLogDto: RejectActivityLogDto,
    @ExtractUser() adminUser: IAdminUserModel,
  ): Promise<ActivityLogPresenter> {
    const activityType = await this.rejectActivityLogUsecase.execute(
      activityLogId,
      rejectActivityLogDto,
      adminUser,
    );
    return new ActivityLogPresenter(activityType);
  }
}
