import { Body, UseGuards } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { CreateActivityLogByAdminDto } from 'src/api/activity-log/dto/create-activity-log-by-admin.dto';
import { ActivityLogPresenter } from 'src/api/activity-log/presenters/activity-log.presenter';
import { CreateActivityLogByRegularUser } from 'src/usecases/activity-log/create-activity-log-by-regular-user.usecase';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('mobile/activity-log')
export class MobileActivityLogController {
  constructor(
    private readonly createActivityLogByRegularUser: CreateActivityLogByRegularUser,
  ) {}

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
