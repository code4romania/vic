import { Get, Param, UseGuards } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { IdAndNamePresenter } from 'src/infrastructure/presenters/id-name.presenter';
import { IActivityTypeModel } from 'src/modules/activity-type/models/activity-type.model';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { GetManyActivityTypeUseCase } from 'src/usecases/activity-type/get-all-activity-type.usecase';
import { ActivityTypeStatus } from 'src/modules/activity-type/enums/activity-type-status.enum';

// TODO: Volunteer Guard
@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('mobile/activity-type')
export class MobileActivityTypeController {
  constructor(
    private readonly getManyActivityTypesUsecase: GetManyActivityTypeUseCase,
  ) {}

  @Get(':organizationId')
  async getMany(
    @Param('organizationId', UuidValidationPipe) organizationId: string,
  ): Promise<IdAndNamePresenter<IActivityTypeModel>[]> {
    const types = await this.getManyActivityTypesUsecase.execute({
      organizationId,
      status: ActivityTypeStatus.ACTIVE,
    });

    return types.map((type) => new IdAndNamePresenter(type));
  }
}
