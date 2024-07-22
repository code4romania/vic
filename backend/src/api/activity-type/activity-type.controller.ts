import {
  UseGuards,
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { ActivateActivityTypeUseCase } from 'src/usecases/activity-type/activate-activity-type.usecase';
import { ArchiveActivityTypeUseCase } from 'src/usecases/activity-type/archive-activity-type.usecase';
import { CreateActivityTypeUseCase } from 'src/usecases/activity-type/create-activity-type.usecase';
import { GetManyActivityTypeUseCase } from 'src/usecases/activity-type/get-all-activity-type.usecase';
import { GetOneActivityTypeUseCase } from 'src/usecases/activity-type/get-one-activity-type.usecase';
import { UpdateActivityTypeUseCase } from 'src/usecases/activity-type/update-activity-type.usecase';
import { CreateActivityTypeDto } from './dto/create-activity-type.dto';
import { GetActivityTypesDto } from './dto/get-activity-types.dto';
import { UpdateActivityTypeDto } from './dto/update-activity-type.dto';
import { ActivityTypeGuard } from './guards/activity-type.guard';
import { ActivityTypePresenter } from './presenters/activity-type.presenter';

@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard, ActivityTypeGuard)
@Controller('activity-type')
export class ActivityTypeController {
  constructor(
    private readonly createActivityTypeUseCase: CreateActivityTypeUseCase,
    private readonly updateActivityTypeUseCase: UpdateActivityTypeUseCase,
    private readonly getOneActivityTypeUseCase: GetOneActivityTypeUseCase,
    private readonly getManyActivityTypeUseCase: GetManyActivityTypeUseCase,
    private readonly archiveActivityTypeUseCase: ArchiveActivityTypeUseCase,
    private readonly activateActivityTypeUseCase: ActivateActivityTypeUseCase,
  ) {}

  @Get()
  async getMany(
    @ExtractUser() user: IAdminUserModel,
    @Query() activityTypeFilters: GetActivityTypesDto,
  ): Promise<ActivityTypePresenter[]> {
    const activityTypes = await this.getManyActivityTypeUseCase.execute({
      organizationId: user.organizationId,
      ...activityTypeFilters,
    });

    return activityTypes.map((activity) => new ActivityTypePresenter(activity));
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async get(
    @Param('id', UuidValidationPipe) activityTypeId: string,
  ): Promise<ActivityTypePresenter> {
    const accessRequest =
      await this.getOneActivityTypeUseCase.execute(activityTypeId);
    return new ActivityTypePresenter(accessRequest);
  }

  @ApiBody({ type: CreateActivityTypeDto })
  @Post()
  async create(
    @ExtractUser() admin: IAdminUserModel,
    @Body() newActivityType: CreateActivityTypeDto,
  ): Promise<ActivityTypePresenter> {
    const activityType = await this.createActivityTypeUseCase.execute(
      {
        organizationId: admin.organizationId,
        ...newActivityType,
      },
      admin,
    );
    return new ActivityTypePresenter(activityType);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateActivityTypeDto })
  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) activityTypeId: string,
    @Body() newActivityType: UpdateActivityTypeDto,
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<ActivityTypePresenter> {
    const activityType = await this.updateActivityTypeUseCase.execute(
      {
        id: activityTypeId,
        ...newActivityType,
      },
      admin,
    );
    return new ActivityTypePresenter(activityType);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Patch(':id/archive')
  async archive(
    @Param('id', UuidValidationPipe) activityTypeId: string,
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<ActivityTypePresenter> {
    const activityType = await this.archiveActivityTypeUseCase.execute(
      activityTypeId,
      admin,
    );
    return new ActivityTypePresenter(activityType);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Patch(':id/activate')
  async activate(
    @Param('id', UuidValidationPipe) activityTypeId: string,
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<ActivityTypePresenter> {
    const activityType = await this.activateActivityTypeUseCase.execute(
      activityTypeId,
      admin,
    );
    return new ActivityTypePresenter(activityType);
  }
}
